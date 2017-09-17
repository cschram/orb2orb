import React from 'react';
import './select.css';

export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    open = () => this.setState({ open: true });
    close = () => this.setState({ open: false });
    handleChange(option) {
        return () => {
            this.props.onChange(option);
            this.close();
        };
    }

    renderOption = (option, i) => {
        return (
            <li key={i} className="select__option" onClick={this.handleChange(option)}>
                {typeof this.props.renderOption === 'function' ?
                    this.props.renderOption(option) :
                    option}
            </li>
        );
    };

    render() {
        return (
            <div className={`select ${this.props.className || ''}`}>
                <div className="select__toggle">
                    {this.state.open ?
                        <i className="fa fa-caret-up" aria-hidden="true" onClick={this.close}></i> :
                        <i className="fa fa-caret-down" aria-hidden="true" onClick={this.open}></i>}
                </div>
                <div className="select__value">
                    {typeof this.props.renderValue === 'function' ?
                        this.props.renderValue(this.props.value) :
                        this.props.value}
                </div>
                <ul className="select__options" hidden={!this.state.open}>
                    {this.props.options.map(this.renderOption)}
                </ul>
            </div>
        );
    }
}