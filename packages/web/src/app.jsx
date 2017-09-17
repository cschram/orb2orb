import React from 'react';
import fetch from 'isomorphic-fetch';
import {
    currencies,
    commonCurrencies,
    breachCurrencies,
    mapCurrencies,
    thumbnails
} from './constants';
import Thumbnail from './thumbnail';
import Select from './select';
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
            exchangeTo: localStorage.getItem('exchangeTo') || 'Chaos Orb',
            values,
            total: -1,
            subtotals: {},
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
            exchangeTo: 'Chaos Orb',
            values,
            total: -1,
            subtotals: {},
            calculating: false
        });
    };

    calculate = async () => {
        this.setState({
            exchangeTo: this.state.exchangeTo,
            values: this.state.values,
            total: -1,
            subtotals: {},
            calculating: true
        });
        const payload = {
            from: currencies.map(currency => {
                return {
                    name: currency,
                    value: this.state.values[currency]
                };
            }),
            to: this.state.exchangeTo
        };
        const response = await fetch('/api/currency/calc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        const subtotals = {};
        data.subtotals.forEach(subtotal => {
            subtotals[subtotal.name] = subtotal.value;
        });
        if (this.state.calculating) {
            this.setState({
                exchangeTo: this.state.exchangeTo,
                values: this.state.values,
                total: data.total,
                subtotals,
                calculating: false
            });
        }
    };

    handleSelectChange = (currency) => {
        localStorage.setItem('exchangeTo', currency);
        this.setState({
            exchangeTo: currency,
            values: this.state.values,
            total: -1,
            subtotals: {},
            calculating: false
        });
    };

    handleChange(currency) {
        return (event) => {
            const values = this.state.values;
            values[currency] = parseInt(event.target.value, 10);
            localStorage.setItem('values', JSON.stringify(values));
            this.setState({
                exchangeTo: this.state.exchangeTo,
                values,
                total: -1,
                subtotals: {},
                calculating: false
            });
        };
    }

    renderSelectValue = (currency) => {
        return (
            <div className="currency-value">
                <Thumbnail currency={currency} width={25} height={25} />
                <span>{currency}</span>
            </div>
        );
    };

    renderSelectOption = (currency) => {
        return (
            <div className="currency-option">
                <Thumbnail currency={currency} width={25} height={25} />
                <span>{currency}</span>
            </div>
        );
    };

    renderInput = (currency) => {
        return (
            <li key={currency} className="currency-input">
                <h4>{currency}</h4>
                {this.state.total >= 0 ?
                    <h5>{`${this.state.subtotals[currency].toFixed(2)} of total`}</h5> :
                    null}
                <Thumbnail currency={currency} />
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
                    <h2>Convert To</h2>
                    <Select value={this.state.exchangeTo}
                            options={currencies}
                            renderValue={this.renderSelectValue}
                            renderOption={this.renderSelectOption}
                            onChange={this.handleSelectChange} />
                    <h2>Total</h2>
                    {this.state.total >= 0 ?
                        <span className="total">{this.state.total.toFixed(2)} {this.state.exchangeTo}(s)</span> :
                        <button onClick={this.calculate}>
                            {this.state.calculating ?
                                <span>Converting <i className="fa fa-spinner" aria-hidden="true"></i></span> :
                                <span>Convert</span>}
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