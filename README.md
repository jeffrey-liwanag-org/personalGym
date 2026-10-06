# personalGym

A standalone, offline copy of the openGym exercise library: 1,324 exercises with a still image
and an animated GIF each, plus a single-file HTML catalog to browse them.

## Layout

```
catalog/
  exercise-catalog.html   open this in a browser; works offline, no server needed
data/
  exercises-data.js       verbatim copy of openGym/frontend/src/lib/exercises-data.js
  exercises.json          the same 1,324 entries as plain JSON
media/
  images/<body-part>/     one JPG per exercise, e.g. images/chest/0025-xxxx.jpg
  gifs/<body-part>/       one animated GIF per exercise, same file stem
programs/
  weight-loss-program.html        12-week weight-loss programme, with demos from media/
  weight-loss-plan.opengym.json   the same programme as an openGym plan file (Plan → Import)
docs/
  index.html                      the programme as published on GitHub Pages; demos stream from
                                  the dataset's jsDelivr mirror instead of media/
tools/
  build-catalog.js        regenerates data/exercises.json, media/ and the catalog page
  build-program.js        regenerates the programme page and its plan file (`--cdn` for docs/)
```

`media/` is gitignored and absent from a fresh clone. The catalog and the offline programme page
need it; run the rebuild below once to fetch it.

Body-part folders: `back`, `cardio`, `chest`, `lower-arms`, `lower-legs`, `neck`,
`shoulders`, `upper-arms`, `upper-legs`, `waist`.

## Data fields (exercises.json)

| key | meaning |
|-----|---------|
| id  | four-digit exercise id, also the file-name prefix of its media |
| n   | name |
| bp  | body part (the media folder) |
| eq  | equipment |
| tg  | target muscle |
| mg  | main muscle group |
| sm  | secondary muscles |
| st  | step-by-step instructions |
| img / gif | media file names |

## Rebuilding

```
git clone --depth 1 https://github.com/hasaneyldrm/exercises-dataset <checkout>
node tools/build-catalog.js <checkout>
```

Run it without the argument to rebuild only the JSON and the catalog page.

## Provenance and licence

Exercise metadata and instructions come from openGym (AGPL-3.0) and originate in ExerciseDB v1,
redistributed by `hasaneyldrm/exercises-dataset` (MIT). The images and GIFs are
© Gym visual (https://gymvisual.com/) and are used under that dataset's terms. openGym itself
deliberately does not ship them. Keep this folder for personal use; reusing the media elsewhere
needs a licence from Gym visual.
