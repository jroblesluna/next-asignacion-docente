rm -rf node_modules
rm -rf build
rm -rf .node-app
npm install
npm run build
cp -R ./build/static ./build/standalone/build/static
cp -R ./public ./build/standalone
cd ./build/standalone
zip -qr ../../release.zip ./*
cd ../..
mkdir .node-app
cd .node-app
mv ../release.zip .
unzip -q release.zip
cp ../.env .
node server.js
cd ..
rm -rf build
rm -rf .node-app