import React from 'react';
import fetch from 'isomorphic-fetch';
import { currencies, thumbnails } from './constants';
import './app.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        let values = {};
        currencies.forEach(currency => {
            values[currency] = 0;
        });
        this.state = {
            values,
            result: -1,
            calculating: false
        };
    }

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
        this.setState({
            values: this.state.values,
            result: data.total,
            calculating: false
        });
    };

    handleChange(currency) {
        return (event) => {
            const values = this.state.values;
            values[currency] = parseInt(event.target.value, 10);
            this.setState({
                values,
                result: -1,
                calculating: false
            });
        };
    }

    renderInput = (currency) => {
        return (
            <li key={currency}>
                <h5>{currency}</h5>
                <img title={currency} src={thumbnails[currency]} />
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
                        <span className="result">Total Worth In Chaos: {this.state.result}</span> :
                        <button onClick={this.calculate}>
                            {this.state.calculating ? 'Calculating...' : 'Calculate'}
                        </button>}
                </header>
                <ul className="inputs">{currencies.map(this.renderInput)}</ul>
            </div>
        );
    }
}