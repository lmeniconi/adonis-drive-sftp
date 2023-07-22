Configure SFTP driver

## Validating environment variables
The configuration for SFTP relies on certain environment variables and it is usually a good practice to validate the presence of those environment variables.
Open `env.ts` file and paste the following code inside it.

```ts
SFTP_HOST: Env.schema.string(),
SFTP_PORT: Env.schema.number(),
SFTP_USERNAME: Env.schema.string(),
SFTP_PASSWORD: Env.schema.string(),
```

## Define config
Open the `config/drive.ts` and paste the following code snippet inside it.

```ts
{
  disks: {
    // ... other disk

    sftp: {
      driver: 'sftp',
      host: Env.get('SFTP_HOST'),
      port: Env.get('SFTP_PORT'),
      username: Env.get('SFTP_USERNAME'),
      password: Env.get('SFTP_PASSWORD')
    }
  }
}
```