# Jemena + Powershop = Almost real time total usage

If you live in an area with Jemena power infrastructure you can use this to pull your power
usage stats and your total from Powershop and see what your usage is quicker than powershop
updates your stats.

## How to run:

```bash
git clone git@github.com:ryanseddon/jemena-powershop.git
cd jemena-powershop
npm install
JEMENA_USERNAME=[username] JEMENA_PASSWORD=[password] PS_USERNAME=[powershop username] PS_PASSWORD=[powershop password] node src/index.js
```

## Example output

```
Powershops latest estimate: 10508.354
New total: 10520.223
```

## Limitations

At the moment todays total is always a sum of power used since 12am today.
