# The Pattern

The thinking behind this repository, in long form.

## Why verification is the real work

When writing code is the expensive step, you optimize for producing it. When an AI makes producing it cheap, the expensive step becomes deciding whether to trust what was produced. Most failed adoptions of AI coding tools miss this: they speed up authorship and leave verification unchanged, so the work simply piles up in front of human reviewers. More gets written, more breaks, and reviewers burn out.

So the goal is never "more code shipped." It is **more problems solved without review getting slower or things breaking more often.** That reframing drives every choice here.

## Blast radius, not seniority

The instinct is to gate by *who* is making a change. The better axis is *how much damage the change could do* — its blast radius — because that's what actually determines how much verification it needs.

A change to copy or validation logic is fully covered by automated tests; if it's wrong, the gate catches it and nothing reaches users. A change to the database schema can corrupt data in ways no test fully anticipates. Those deserve different paths regardless of who is typing.

## The tiers, mapped to this repo

| Tier | Paths here | Verification | Who authors |
|------|-----------|--------------|-------------|
| Low | `src/tasks/validate.js`, `tests/`, `docs/` | Unit tests cover it completely | Anyone, including non-engineers with AI help |
| Mid | `src/tasks/router.js`, `src/tasks/repo.js`, `src/app.js` | Tests + a required human review | AI-assisted, engineer-reviewed |
| High | `migrations/`, `src/db.js`, `.github/`, `.claude/` | Tests + owner review + extra scrutiny | Engineer-authored |

The tiers aren't enforced by trust. They're enforced by configuration: `CODEOWNERS` pulls an owner into any high-tier change, the agent's `ask`/`deny` rules slow it down on risky paths, and CI blocks everything that fails.

## Two layers of defense on the agent

1. **Permission rules** (`.claude/settings.json`) govern what the agent *decides* to do — allow the safe commands, ask before risky ones, deny the dangerous ones outright. A denial can't be overridden by an allow, even in bypass mode, so the deny-list is the true boundary.
2. **Isolation** removes the *ability* to do harm regardless of decisions: no production credentials in the agent's environment, so production is unreachable rather than merely off-limits.

Decisions can be wrong; reachability can't be argued with. You want both.

## Why the database story is the centerpiece

Schema and data changes are where AI assistance is most useful and most dangerous. The pattern here — the agent writes a migration, CI applies it to a throwaway database, an owner reviews it, and it reaches production only through the normal deploy process — is the template for any high-risk change. Get this loop right and the rest of the tiers follow the same shape.
