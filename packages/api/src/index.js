"use strict";
const Hapi = require('hapi');
const Boom = require('boom');
const Joi = require('joi');
const request = require('request');
const loadConfig = require('./config');

function get(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

async function getExchangeRates(config) {
    const results = await Promise.all(config.general.endpoints.map(endpoint => {
        return get(`${config.general.statsAPI}/${endpoint}?league=${config.general.league}`);
    }));
    const lines = results.reduce((lines, result) => lines.concat(result.lines), []);
    const rates = {};
    lines.forEach(line => {
        rates[line.currencyTypeName] = parseFloat(line.receive.value);
    });
    rates['Chaos Orb'] = 1;
    return rates;
}

if (!process.env.APP_CONFIG) {
    console.error('Missing APP_CONFIG environment variable');
} else {
    loadConfig(process.env.APP_CONFIG).then(config => {
        const server = new Hapi.Server();
        server.connection({
            host: config.api.host,
            port: config.api.port
        });

        server.route({
            method: 'GET',
            path: '/currency/rates',
            async handler(request, reply) {
                const rates = await getExchangeRates(config);
                reply(rates);
            }
        });

        server.route({
            method: 'POST',
            path: '/currency/calc',
            config: {
                validate: {
                    payload: {
                        from: Joi.array().items({
                            name: Joi.string(),
                            value: Joi.number()
                        }),
                        to: Joi.string()
                    }
                }
            },
            async handler(request, reply) {
                const rates = await getExchangeRates(config);
                try {
                    if (!(request.payload.to in rates)) {
                        throw Boom.badRequest(`Invalid currency "${request.payload.to}`);
                    }
                    const subtotals = request.payload.from.map(currency => {
                        if (currency.name in rates) {
                            return {
                                name: currency.name,
                                value: (currency.value * rates[currency.name]) / rates[request.payload.to]
                            };
                        } else {
                            throw Boom.badRequest(`Invalid currency "${currency.name}"`)
                        }
                    });
                    const total = subtotals.reduce((total, subtotal) => {
                        return total + subtotal.value;
                    }, 0);
                    reply({
                        total,
                        subtotals
                    });
                } catch(error) {
                    console.error(error);
                    reply(error);
                }
            }
        });

        server.start(error => {
            if (error) {
                console.error(error);
            } else {
                console.log(`Running at ${config.api.host}:${config.api.port}`);
            }
        });
    }).catch(error => {
        console.error(error);
    });
}