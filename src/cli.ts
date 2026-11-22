#!/usr/bin/env node

import { main } from './play.js';
import { terminalIO } from './terminal/index.js';

await main(terminalIO);
