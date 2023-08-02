/*
 * @lmeniconi/adonis-drive-sftp
 *
 * (c) Luciano Meniconi <luciano.meniconi.r@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from "path"
import dotenv from "dotenv"
import { Filesystem } from "@poppinss/dev-utils"
import { Application } from "@adonisjs/core/build/standalone"

dotenv.config()

export const SFTP_HOST = process.env.SFTP_HOST!
export const SFTP_PORT = process.env.SFTP_PORT!
export const SFTP_USERNAME = process.env.SFTP_USERNAME!
export const SFTP_PASSWORD = process.env.SFTP_PASSWORD!
export const SFTP_ROOT_DIRECTORY = process.env.SFTP_ROOT_DIRECTORY!

export const authenticationOptions = {
  host: SFTP_HOST,
  port: parseInt(SFTP_PORT),
  username: SFTP_USERNAME,
  password: SFTP_PASSWORD,
}

export function getFileName(fileName: string) {
  return `${SFTP_ROOT_DIRECTORY}/${fileName}`
}

export const fs = new Filesystem(join(__dirname, "__app"))

/**
 * Setup adonisjs application
 */
export async function setupApplication(options?: {
  autoProcessMultipartFiles?: boolean
}) {
  const app = new Application(fs.basePath, "web", {
    providers: ["@adonisjs/core"],
  })

  await fs.add(
    "config/app.ts",
    `export default {
        appKey: 'asecurerandomsecretkey',
        http: {
          cookie: {},
          trustProxy: () => true
        }
      }`
  )

  await fs.add(
    "config/bodyparser.ts",
    `export default {
      whitelistedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      multipart: {
        autoProcess: ${options?.autoProcessMultipartFiles || false},
        processManually: [],
        types: [
          'multipart/form-data',
        ],
      }
    }`
  )

  await app.setup()
  await app.registerProviders()
  await app.bootProviders()

  return app
}
