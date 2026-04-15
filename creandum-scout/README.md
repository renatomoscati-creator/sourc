# Creandum Startup Scout — Qwen Code Setup

## Quick Setup

### 1. Copy the agents to your Qwen Code agents directory

```bash
# User-level agents (available in all projects)
cp agents/*.md ~/.qwen/agents/

# OR project-level agents (only this project)
mkdir -p .qwen/agents
cp agents/*.md .qwen/agents/
```

### 2. Copy the QWEN.md to your project root

```bash
cp QWEN.md ./QWEN.md
```

### 3. Verify agents are installed

Open Qwen Code and run:
```
/agents manage
```

You should see all 5 scouts:
- `vertical-ai-scout`
- `infra-scout`
- `fintech-scout`
- `consumer-scout`
- `climate-scout`

### 4. Launch the orchestrator

Paste this prompt to kick off all 5 scouts in parallel:

```
I need you to find the single best early-stage European startup for Creandum to invest in.

Follow the orchestration protocol in QWEN.md. Dispatch all 5 scout subagents in parallel now:

1. Use the vertical-ai-scout subagent to find 3-5 pre-seed/seed European startups applying AI to underserved professional workflows like procurement, compliance, audit, or supply chain.

2. Use the infra-scout subagent to find 3-5 pre-seed/seed European startups building AI/developer infrastructure like inference optimization, observability, or GPU orchestration.

3. Use the fintech-scout subagent to find 3-5 pre-seed/seed European fintech startups in embedded finance, AI-native FP&A, treasury automation, or B2B payments.

4. Use the consumer-scout subagent to find 3-5 pre-seed/seed European consumer tech startups with network effects and exceptional design.

5. Use the climate-scout subagent to find 3-5 pre-seed/seed European climate/deep tech startups with strong software moats.

After all scouts return results, consolidate everything into a ranked comparison table, score each candidate (founder quality, product/traction, market size, Creandum fit, timing — each 0-10), pick the single best one, and write a 200-word investment memo. Save the final output to creandum-pick.md.
```

## File Structure

```
creandum-scout-agents/
├── README.md              # This file
├── QWEN.md                # Orchestrator instructions (goes in project root)
└── agents/
    ├── vertical-ai-scout.md   # AI for professional verticals
    ├── infra-scout.md          # AI/developer infrastructure
    ├── fintech-scout.md        # Next-gen fintech
    ├── consumer-scout.md       # Consumer tech + network effects
    └── climate-scout.md        # Climate tech with software moats
```

## Tips for Better Results

- **Triggering subagents reliably**: The prompt above uses explicit "Use the [name] subagent to..." phrasing, which is the most reliable way to trigger delegation in Qwen Code.
- **If a scout doesn't fire**: You can manually invoke it with: `Use the infra-scout subagent to search for European AI infrastructure startups at seed stage.`
- **Model choice**: The agents are configured for `qwen3-coder-plus`. If you have API access to a stronger model, update the `modelConfig.model` field in each agent's frontmatter.
- **Extending**: To add a new vertical (e.g., health-tech), just create a new `.md` file in the agents directory following the same template pattern.

## Notes

- Each subagent runs with its own isolated context — they won't interfere with each other.
- The `runConfig.max_turns: 25` gives each agent enough room for multiple search-fetch-analyze cycles.
- Temperature is set low (0.4) for scouts to keep results factual; consumer-scout is slightly higher (0.5) for more creative sourcing.
