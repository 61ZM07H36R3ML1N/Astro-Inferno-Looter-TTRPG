# Contributing to Astro Inferno

First off, thank you for considering contributing to Astro Inferno! It's people like you that make Astro Inferno and The H.A.V.E.N. community such a great place. 

This document provides guidelines and instructions for contributors to the project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please read the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) file before interacting with the repository or community.

## Getting Started

Astro Inferno is built using React, Vite 6, Tailwind CSS, and Firebase. To set up your local development environment:

1. **Fork the repository** and clone it locally.
2. **Install dependencies:** Run `npm install` (or your preferred package manager).
3. **Configure Firebase:** Set up your `.env` file with your local Firebase development configuration.
4. **Run the local server:** Execute `npm run dev` to start the Vite 6 development server.

## How Can I Contribute?

### Reporting Bugs

If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue to our GitHub Repository. Before submitting a bug report, please check the existing issues to see if the bug has already been reported. 

When opening an issue, please include:
* A descriptive title.
* Detailed steps to reproduce the bug.
* Expected behavior vs. actual behavior.
* Screenshots of the UI, especially for mobile layout issues.

### Suggesting Enhancements

We welcome suggestions for new features or improvements to the Blackjack Engine, the procedural armory, or the Overseer UI. When submitting an enhancement request, please clearly describe the feature, why you need it, and how it should work mechanically within the Astro Inferno ruleset.

### Pull Requests

Please follow these steps to have your contribution considered by the maintainers:

1. **Create a branch** for your edits.
2. **Commit your changes:** Write clear, concise commit messages. 
3. **Test your changes:** Ensure your code doesn't break existing UI elements or the real-time Firebase sync logic.
4. **Submit a Pull Request (PR):** Reference any relevant issues in your PR (for example, "Closes #37"). Include a clear description of the problem and solution.

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature").
* Limit the first line of the commit description to 72 characters or less for better readability.
* Group related changes into single commits when possible, but keep unrelated changes in separate commits.

### Coding Conventions

* Code should be optimized for readability.
* Follow existing React and Tailwind CSS conventions used throughout the project.
* Keep React components clean and modular (e.g., matching the structure of the `SquadTab` and `OverseerTab` modules).

## Community

If you have questions, need clarification on the mechanics, or just want to chat about the game, the best place to reach out is within **The Gremlin Brigade** Discord server.
