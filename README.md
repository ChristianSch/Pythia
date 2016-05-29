# Pythia ![strider build badge](http://ci.andinfinity.de/ChristianSch/Pythia/badge?branch=master) [![Coverage Status](https://coveralls.io/repos/github/ChristianSch/Pythia/badge.svg?branch=master)](https://coveralls.io/github/ChristianSch/Pythia?branch=master)
Machine Learning experiment management platform.

Manage your ml experiments to have all your results in one place. Pythia tries
to give you an overview even if you have experiments running in different
places.

For this, you consume an API of a Pythia instance in your experiment(s). A
Python library is currently in the making
[here](https://github.com/ChristianSch/PyPythia).

**Please note that Pythia is not yet ready to use. The API lacks some routes,
the frontend is nowhere near finished, we have no charts or anything beyond
sole listing of experiments and models.**


However, I'm always keen to hear your feedback, so create an issue or drop
me a comment on twitter: [@andinfinity_GER](https://twitter.com/andinfinity_GER).

This work was inspired by [FBLearner FLow](https://code.facebook.com/posts/1072626246134461/introducing-fblearner-flow-facebook-s-ai-backbone/)
and [Pastalog](https://github.com/rewonc/pastalog).

## Installation
Fetch the latest release as a `zip` file or fetch the code via `git clone`. `cd` into the
directory.

### Dependencies
Fetch all the dependencies via `npm install`.

### Running
With a running MongoDB instance just issue `node .` in the root directory of the project.
Pythia is now available via browser or via API.

## License
The MIT License (MIT)

Copyright (c) 2016 Christian Schulze

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
