# Yttria Programming Language

Yttria is a versatile and powerful general-purpose programming language designed to provide a coherent blend of performance, expressiveness, and ease of use. Developed using TypeScript, Yttria leverages LLVM bindings to generate an Intermediate Representation (IR), which can be further compiled using GCC for optimal performance and for target architectures.

> **Note:** Yttria is still in its development stage.

## Getting Started

To contribute to the development of Yttria, you can follow the steps below by cloning the repository first:

```git
git clone https://github.com/nthnn/yttria-lang.git
```

**Required Softwares**

1. [NodeJS](https://nodejs.org/en) - The development uses version 20.4.0.
2. [VS Code](https://code.visualstudio.com/) - Optional. Used for editing codes and more.

**Development Commands**

- `npm run install-modules` - Used for installing required node modules. Should be executed after downloading or cloning the whole repository.

- `npm run build` - For cleaning up existing multiple source file builds, and then re-building again.

- `npm run daemon` - Command for starting a listening nodemon every code changes.

- `npm run clean` - Cleaning up all the build files.

- `npm run pack` - Package up the latest code base to generate executables for Linux, macOS, Windows, and Alpine.

- `npm run yttria` - Run the latest built Yttria on console.

## Contributing

Contributions to the Yttria programming language are welcome and encouraged! To contribute, follow these steps:

1. Fork the Yttria repository on GitHub.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature or bug fix.
4. Make your changes and commit them with descriptive commit messages.
5. Push your changes to your GitHub repository.
6. Submit a pull request to the main Yttria repository.

## License

Copyright 2023 Nathanne Isip

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.