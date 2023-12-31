/*
 * @lmeniconi/adonis-drive-sftp
 *
 * (c) Luciano Meniconi <luciano.meniconi.r@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Core/Drive" {
  import { default as SftpClient } from "ssh2-sftp-client"

  /**
   * Configuration accepted by the sftp driver
   */
  export type SftpDriverConfig = {
    driver: "sftp"
    host: string
    port: number
    username: string
    password: string
  }

  /**
   * The sftp driver implementation interface
   */
  export interface SftpDriverContract extends DriverContract {
    name: "sftp"
    adapter: SftpClient
  }

  interface DriversList {
    sftp: {
      implementation: SftpDriverContract
      config: SftpDriverConfig
    }
  }
}
