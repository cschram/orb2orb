import React from 'react';
import fetch from 'isomorphic-fetch';
import {
    currencies,
    commonCurrencies,
    breachCurrencies,
    mapCurrencies,
    thumbnails
} from './constants';
import './app.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        let values = {};
        let storedValues = {};
        if (localStorage.getItem('values')) {
            storedValues = JSON.parse(localStorage.getItem('values'));
        }
        currencies.forEach(currency => {
            if (storedValues[currency]) {
                values[currency] = storedValues[currency];
            } else {
                values[currency] = 0;
            }
        });
        this.state = {
            values,
            result: -1,
            calculating: false
        };
    }

    clear = () => {
        let values = {};
        currencies.forEach(currency => {
            values[currency] = 0;
        });
        localStorage.removeItem('values');
        this.setState({
            values,
            result: -1,
            calculating: false
        });
    };

    calculate = async () => {
        this.setState({
            values: this.state.values,
            result: -1,
            calculating: true
        });
        const payload = {
            currency: currencies.map(currency => {
                return {
                    name: currency,
                    value: this.state.values[currency]
                };
            })
        };
        const response = await fetch('/api/currency/calc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (this.state.calculating) {
            this.setState({
                values: this.state.values,
                result: data.total,
                calculating: false
            });
        }
    };

    handleChange(currency) {
        return (event) => {
            const values = this.state.values;
            values[currency] = parseInt(event.target.value, 10);
            localStorage.setItem('values', JSON.stringify(values));
            this.setState({
                values,
                result: -1,
                calculating: false
            });
        };
    }

    renderInput = (currency) => {
        const thumbnailStyle = {
            backgroundImage: `url(${thumbnails[currency]})`
        };
        return (
            <li key={currency}>
                <h5>{currency}</h5>
                <span className="thumbnail" title={currency} style={thumbnailStyle}></span>
                <input type="number"
                       min="0"
                       step="1"
                       value={this.state.values[currency]}
                       onChange={this.handleChange(currency)} />
            </li>
        );
    };

    render() {
        return (
            <div className="app">
                <header>
                    <h1>Path of Exile Currency Calculator</h1>
                    {this.state.result >= 0 ?
                        <span className="result">Total Worth: <strong>{this.state.result.toFixed(2)} Chaos Orb(s)</strong></span> :
                        <button onClick={this.calculate}>
                            {this.state.calculating ?
                                <span>Calculating <i className="fa fa-spinner" aria-hidden="true"></i></span> :
                                <span>Calculate</span>}
                        </button>}
                    <button className="clear" onClick={this.clear}>Clear</button>
                </header>
                <div className="input-section">
                    <h2>Common Currencies</h2>
                    <ul className="inputs">{commonCurrencies.map(this.renderInput)}</ul>
                </div>
                <div className="input-section">
                    <h2>Map Currencies</h2>
                    <ul className="inputs">{mapCurrencies.map(this.renderInput)}</ul>
                </div>
                <div className="input-section">
                    <h2>Breach Currencies</h2>
                    <ul className="inputs">{breachCurrencies.map(this.renderInput)}</ul>
                </div>
            </div>
        );
    }
}