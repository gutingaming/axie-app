# Axie App

<img width="979" alt="demo" src="https://user-images.githubusercontent.com/579145/141709984-5752793d-71e3-4ccf-b3f9-76f30e8f6db7.png">

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

`{account_name},{ronin_address},{private_key}`

```
my_acc1,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
my_acc2,ronin:xxxxxxxxxxxxxxxxxxxxxxxx,0xaaaaaaaaaaaaaaaaaaaaaaa
```

### Transfer Mode

Import transferee accounts should follow the CSV format as below:

`{slp_amount},{ronin_address}`

```
3162,ronin:xxxxxxxxxxxxxxxxxxxxxxx
1581,ronin:xxxxxxxxxxxxxxxxxxxxxxx
```
