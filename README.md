# Axie App

Provide axie account manager a fast and less complex way to claim and transfer SLP to scholar.

<img width="857" alt="demo" src="https://user-images.githubusercontent.com/579145/144641252-f6b2dfdb-3da7-4745-9078-da2c72b80140.png">

## Features

- One click to claim and transfer SLP
- Support CSV import
- Support i18n (zh_TW and en_US)

## Usage

Run dev server

```
yarn dev
```

Build desktop app

```
yarn build
```

## CSV Import Usage

### Claim Mode

Import Axie accounts should follow the CSV format as below:

`{name},{ronin_address},{private_key}`

```
my_acc1,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
my_acc2,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
```

### Transfer Mode

Import transferee accounts should follow the CSV format as below:

`{name},{slp_amount},{ronin_address}`

```
player1,3162,ronin:xxxxxxxxxxxxxxxxxxxxxxx
player2,1581,ronin:xxxxxxxxxxxxxxxxxxxxxxx
```
