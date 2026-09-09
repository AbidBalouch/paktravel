# Travel Pakistan — Frontend (Header + Footer + Banner, dynamic from WordPress)

Ye ek **complete, standalone Next.js project** hai. Isay apne purane
confuse-shuda project ke sath merge na karein — bas isay extract kar ke
seedha run kar dein.

## Chalane ka tareeqa (sirf 2 commands)

Terminal / CMD kholein, is folder ke andar jayein, phir:

```bash
npm install
npm run dev
```

Phir browser me `http://localhost:3000` kholein — Header, Footer aur
Banner teeno WordPress se live data ke sath dikhne chahiye.

## Ye project kaise organized hai (sab plain JavaScript hai, koi TypeScript nahi)

```
paktravel/
  app/
    layout.js       -> Plus Jakarta Sans font + Header/Footer wrap
    globals.css      -> colors, container (1250px), reset
    page.js           -> home page (Banner render karta hai)
  components/
    Header/
      Header.jsx          -> server component (data fetch)
      HeaderClient.jsx     -> client component (sticky/transparent->white + mobile menu)
      Header.module.css
    Footer/
      Footer.jsx
      Footer.module.css
    Banner/
      Banner.jsx
      Banner.module.css
  lib/
    api.js              -> teeno endpoints ke fetch functions
  next.config.js         -> WordPress image domain already whitelisted
  jsconfig.json           -> @ import alias already set
  package.json
```

**Maine ye project khud build karke test kiya hai** (`npm install` +
`npm run build`) — koi module-not-found ya syntax error nahi hai. Sirf
live data fetch ke liye aapke internet se WordPress site tak access
chahiye hoga (jo aapke machine par normal hoga).

## Aage kaise badhayen

Jab agle section (Destinations, Attractions, waghera) ka image + JSON
dein ge, main isi pattern par:

1. `lib/api.js` me naya fetch function add karunga
2. `components/<SectionName>/` folder banaunga (server component +
   zaroorat ho to client component + CSS module)
3. Wahi `app/globals.css` ke color variables aur `container` class
   reuse karunga taake pura site consistent design me rahe
4. `app/page.js` me naya component import kar ke add kar dunga

Bas aap mujhe har section ka Figma image + uska JSON endpoint dete
jayen, main component banata jaonga.

## Agar phir bhi koi error aaye

1. Confirm karein ke aap isi naye extracted folder ke andar hain
   (purane `paktravel` project ko is se replace kar dein ya alag
   rakhein — dono ko mix na karein).
2. `node_modules` aur `.next` folder delete kar ke dobara
   `npm install` karein agar koi cache wala masla lage.
3. Poora terminal error message paste kar dein, foran fix kar dunga.
