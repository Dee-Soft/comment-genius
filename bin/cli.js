#!/usr/bin/env node

'use strict';

const { main } = require('../dist/index.js');

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});