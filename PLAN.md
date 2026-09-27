# Noctis Agentic: plan

Where Noctis Agentic is, what gets built next, and what has to be true before each step. The design itself
is in [ARCHITECTURE.md](ARCHITECTURE.md).

**Noctis Agentic is a separate platform** from noctis.zone and noctisswap.zone. It runs on Midnight only, with
its own contract, its own pools and machine fees. noctis.zone and noctisswap.zone are for people and charge
human fees.

## Where it is now

| | Status |
|---|---|
| Concept site, [noctisagentic.zone](https://noctisagentic.zone) | Live as a concept preview. Every agent, coin and figure on it is illustrative. |
| Architecture | Draft, September 2026. Recommendations are proposals until built and audited. |
| Contract, gateway, solver | Not started. |

## The phases

Each phase opens only when the one before it has met its gate.

### Before building: settle the dependencies

- Put the integration questions to Midnight City and get written answers. The design needs agents that hold
  their own keys and can call an outside service, an attestation for each agent key, and owners who hold
  their own keys. See [What Noctis Agentic needs from Midnight City](ARCHITECTURE.md#what-noctis-agentic-needs-from-midnight-city).
- Build the mandate on the format of Midnight's draft standard for private agent mandates
  ([PR #251](https://github.com/midnightntwrk/midnight-improvement-proposals/pull/251)), and offer Noctis
  Agentic's additions (a private daily cap, unlinkable checks and budget custody) back to it.
- Compile a first registry circuit against the pinned Compact toolchain.

### Build

The registry and the mandate check, including the registrar, the spend commitment and the owner's escape
hatch. The City adapter's interface, driven by scripted test agents. Launches, the curve sale and the agent
gateway. Sealed batches and the solver. Then the Preprod integration.

**Gate:** a Midnight City agent registers, launches and trades in sealed batches on Preprod, and its mandate
refuses an action outside its limits.

### Audit and a capped deployment

An audit and code review of the one Compact contract (six parts), the solver and the gateway, with the fixes
reviewed. Authorisation to deploy on Midnight mainnet, with caps.

**Gate:** audit reports in, fixes reviewed, and the deployment authorised with caps.

### Capped mainnet beta

Caps start low, and the schedule for raising them is published. A bug bounty runs from the start, along with
a launch programme for agents (the Agent Arena).

Dates are set once Midnight City has answered and the build is funded.

## Machine fees

These are Noctis Agentic's own fees, and the site draws every fee it shows from one constant, `FEES` in
[`assets/js/shared.js`](assets/js/shared.js).

| Fee | Amount |
|---|---|
| Launch | $10, paid in NIGHT at the oracle rate |
| Agent registration | $5, plus a $25 bond returned on a clean exit |
| Curve trade | 1.5%: 0.5% to the creator agent, 1.0% to the platform |
| Pool trade, after graduation | 0.50%: 0.25% to the creator agent, 0.20% to the platform, 0.05% compounded into the pool |
| Sealed order, after graduation | 1 NIGHT per order |

The post-graduation schedule is set for launch and revisited once real batch data exists.

## Proposed, not settled

- Agent budgets sit in the contract, bounded by the deployment's caps.
- A creator bond for agent launches, large enough to matter at machine speed, forfeited only for rules the
  contract can check, and paid to that launch's holders.
- A liquidity-partner rebate for agents that quote both sides of a batch, never for volume.
- The launch parameters marked ⚑ on the site's How it works page.
