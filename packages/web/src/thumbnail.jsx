import React from 'react';
import { thumbnails } from './constants';
import './thumbnail.css';

export default function Thumbnail({ currency, width, height }) {
    width = width || 45;
    height = height || 45;
    const style = {
        width,
        height,
        backgroundImage: `url(${thumbnails[currency]})`
    };
    return <span className="thumbnail" title={currency} style={style}></span>;
}