# Car Bazaar

A PPI-verified used-car marketplace — buy, sell, or trade-in with confidence.
Built from scratch with vanilla HTML/CSS/JS and a **native Node.js** backend (no frameworks).

## Run it

```bash
node server.js
```

Then open <http://localhost:3000>.

> Open the site through the server (not by double-clicking the HTML files) so the
> `fetch()` calls to `/api/data` and `/api/bookings` resolve.

## Project structure

```
.
├── index.html          # Home: hero, Buy/Sell/Trade matrix, image-map regions, milestone table
├── inventory.html      # Marketplace: dynamic car cards, PPI modals, compare queue, live auction ticker
├── compare.html        # Comparison meter: matrix, best-value badge, depreciation forecast
├── transaction.html    # Buy/Sell/Trade forms + escrow wallet simulator
├── about.html          # Mission, awards, testimonials, chatbox, contribution table
├── css/
│   └── style.css       # Single external stylesheet (design tokens + components)
├── js/
│   ├── main.js         # Nav, active-link, compare queue (localStorage), fetch helper
│   ├── inventory.js    # Cards, modals, auction setInterval ticker
│   ├── compare.js      # Comparison logic, best-value scoring, depreciation
│   ├── validation.js   # External form-validation rules + API submit
│   ├── transaction.js  # Tabs + wallet simulator
│   └── about.js        # Awards/testimonials render + automated chatbox
├── data/
│   └── database.json   # Cars, testimonials, awards, ppi_bookings (POST target)
├── database.sql        # MySQL schema + seed (user: root / password: root)
├── images/             # SVG map + placeholder (drop real car .jpg files here)
└── server.js           # Native Node HTTP server: static + GET/POST JSON API
```

## API

| Method | Route           | Purpose                                            |
|--------|-----------------|----------------------------------------------------|
| GET    | `/api/data`     | Returns cars, testimonials, awards from the JSON DB |
| POST   | `/api/bookings` | Appends a form submission to `ppi_bookings` (no overwrite) |

## SQL (optional relational backend)

```bash
mysql -u root -proot < database.sql
```

Creates the `car_bazaar` database with `cars`, `testimonials`, `awards`,
and `ppi_bookings` tables, seeded to match `data/database.json`.

## Images

Card images reference `images/<name>.jpg` (e.g. `supra.jpg`). If a file is
missing the UI falls back to `images/placeholder.svg`, so the site works
out of the box — drop in real photos to finish the look.
