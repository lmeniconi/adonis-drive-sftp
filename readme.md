# Configuration
Run the following command to configure the package

```bash
node ace configure @lmeniconi/adonis-drive-sftp
```


# Usage
Example of use in a controller

```ts
  const fileName = 'example.txt'

  const sftp = Drive.use('sftp')
  await sftp.put(fileName, "hello world")
```
