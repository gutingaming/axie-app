# Axie App

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

Import Axie accounts should follow the CSV format as below:

`{account_name},{ronin_address},{private_key}`

```
my_acc1,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
my_acc2,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
...
```

Import transferee accounts should follow the CSV format as below:

`{slp_amount},{ronin_address}`

```
3162,ronin:xxxxxxxxxxxxxxxxxxxxxxx
1581,ronin:xxxxxxxxxxxxxxxxxxxxxxx
```
