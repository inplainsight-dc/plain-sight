# Fork In Plain Sight for your city

In Plain Sight is built to be copied. If the rules where you live are hard to
read, you can stand up your own instance. The tools are the same; only the
jurisdiction (and the data) changes.

## Naming convention

Keep the family recognizable with one of these patterns:

| What you're standing up | Domain pattern | Example |
| --- | --- | --- |
| A whole hub for a jurisdiction | `inplainsight-{jurisdiction}.org` | `inplainsight-baltimore.org` |
| A single tool for a jurisdiction | `inplainsight-{tool}-{jurisdiction}.org` | `inplainsight-citator-baltimore.org` |

`{jurisdiction}` is a place (city, county, state). `{tool}` is the tool's short
name. Lowercase, hyphen-separated. `.org` keeps the civic, non-commercial feel,
but use what you can get.

> The DC instance is `inplainsight-dc.org`. New forks register their **own**
> domain — the original only ever owns the DC one.

## How to fork

1. Copy this repo.
2. Edit `src/config/site.ts`: set `name`, `jurisdiction`, `instanceName`,
   `domain`, `url`, your links, and the About text.
3. Replace the cards in `src/data/projects/` with your jurisdiction's tools.
4. Keep `src/styles/global.css` as-is so we stay one visual family (or tweak the
   accent colors if your city has its own palette).
5. `npm run build` and deploy (see DEPLOY.md).

If you fork it, say hi — it'd be lovely to keep a map of where In Plain Sight
has spread.
