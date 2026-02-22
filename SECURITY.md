# Security Policy

The Astro Inferno development team takes the security and integrity of our Virtual Tabletop (VTT) engine seriously. We appreciate your help in keeping the network secure and ensuring a fair, uncompromised gaming experience for all connected squads.

## Supported Versions

Currently, only the latest major release of the Astro Inferno engine is actively supported with security updates. 

| Version | Supported          |
| ------- | ------------------ |
| v3.1.x  | :white_check_mark: |
| < v3.0  | :x:                |

## Scope of Security

For this project, a "security vulnerability" is defined as any exploit or flaw that allows a user to:
* **Bypass Firebase Security Rules:** Gaining unauthorized read/write access to squad lobbies, character sheets, or the Beastiary database.
* **Falsify Telemetry:** Forcing a manipulated dice roll (bypassing the Blackjack engine math) or injecting unauthorized Drop Pod loot into the active lobby.
* **Overseer Hijacking:** Gaining Game Master privileges without the correct lobby authorization, allowing a player to strike other units or spawn Hostile Threats.

### Note on Firebase Configuration Keys
Because this is a React application utilizing Firebase, you will likely see Firebase configuration keys (e.g., `apiKey`, `authDomain`) in the source code or network requests. **This is expected behavior for Firebase web setups and is not considered a security vulnerability.** The true security of the application relies on our backend **Firebase Security Rules**, not the secrecy of the config object. 

## Reporting a Vulnerability

If you discover a valid security vulnerability, please do not open a public GitHub issue. Publicly disclosing an exploit before it is patched puts active campaigns at risk.

Instead, please report the vulnerability confidentially:

1. **Email/Direct Message:** Contact the lead maintainers directly at **[briantjamiel@gmail.com]**.
2. **Details:** Provide a detailed summary of the vulnerability, including step-by-step instructions on how to reproduce the exploit.
3. **Impact:** Briefly explain what a malicious user could achieve with this exploit (e.g., "Allows a player to infinitely spawn Relic-tier weapons without Overseer approval").

### Response Time
We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress in patching the issue. Once the vulnerability is resolved, we will publish a patch and credit you for the discovery (unless you prefer to remain anonymous).
