# Archflow

![React](https://img.shields.io/badge/React-000000?style=flat-square&logo=react&logoColor=61DAFB)
![Build](https://img.shields.io/github/actions/workflow/status/alpercitak/archflow/build.yaml?style=flat-square&label=&color=2ea44f)
![License](https://img.shields.io/badge/MIT-2ea44f?style=flat-square)

Archflow is a lightweight architecture canvas for sketching systems the way teams discuss them in design reviews, then putting load through them to see where they break.

**Live demo: [archflow-app.pages.dev](https://archflow-app.pages.dev/)**

## Features

- Drag clients, gateways, load balancers, services, databases, caches, queues, storage and external APIs from the library onto a pannable, zoomable canvas
- Connect ports to draw flows; double-click a flow to label it, right-click to delete it
- Edit a node's label, sublabel and protocol in the inspector
- Import and export JSON or YAML, export SVG or Mermaid
- Autosaves the diagram in your browser; **Example** restores the sample architecture

## Simulation

Toggle **Simulate** to push traffic through the diagram:

- Clients generate load (req/s); traffic follows edges. Load balancers and gateways route each request to one healthy target; other nodes call all their targets
- Each node handles up to its capacity; the excess is dropped
- Latency grows with utilization (queueing), and each client gets an expected end-to-end latency
- Nodes turn green, amber (≥70%) or red (overloaded); edges show their req/s; the status bar shows throughput, dropped traffic and average latency
- The timeline under the canvas plays the simulation over time (play/pause, reset, 1×/2×/5×/10× speed) and charts throughput, dropped traffic and latency
- Clients can follow a load profile in the inspector: ramp, spike or wave, with editable peak, start and duration
- Right-click a node (or use the inspector actions) to fail it, degrade it (half capacity, double latency) or recover it while simulating; load balancers and gateways fail over to healthy targets, while other nodes drop their calls to a failed target, so failures can cascade. Reset clears failures
- Queues are asynchronous: consumers behind a queue still get load, but their failures and latency don't count against the client request
- Nodes overloaded for 5s crash and recover after 15s; toggle **Auto-fail** on the timeline to turn this off
- Nodes can have a scripted fault in the inspector (down or degraded, with a start and duration in seconds)
- Failures, degradations and recoveries appear as markers on the timeline chart, with the latest ones listed beside it
- **Scenario** presets (Traffic spike, Service failure) replace the canvas with a ready-made run and start it

Every node type has default capacity and latency; override them per node in the inspector.

## Shortcuts

| Key                | Action                      |
| ------------------ | --------------------------- |
| Delete / Backspace | Delete selected node        |
| ⌘/Ctrl + D         | Duplicate selected node     |
| ⌘/Ctrl + 0         | Reset view                  |
| ⌘/Ctrl + Z         | Undo                        |
| ⇧ + ⌘/Ctrl + Z     | Redo                        |
| Esc                | Deselect, cancel connection |

## Development

```bash
bun install
bun dev
```

```bash
bun run check      # biome lint + format
bun run typecheck
bun run test
bun run build
```
