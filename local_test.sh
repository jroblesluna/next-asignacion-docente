rm -rf node_modules
rm -rf build
rm -rf .node-app
npm install
npm run build
cp -R ./build/static ./build/standalone/build/static
cp -R ./public ./build/standalone
cd ./build/standalone
zip ../../release.zip ./* -r
cd ../..
mkdir .node-app
cd .node-app
mv ../release.zip .
unzip release.zip
cp ../.env .
node server.js
