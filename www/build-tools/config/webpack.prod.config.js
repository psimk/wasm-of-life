const merge = require('webpack-merge');
const path = require('path');
const base = require('./webpack.base.config');

module.exports = merge(base, {
	mode: 'production'
});
