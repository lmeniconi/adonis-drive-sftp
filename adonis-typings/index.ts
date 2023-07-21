/*
 * @adonisjs/drive-gcs
 *
 * (c) Luciano Meniconi <luciano.meniconi.r@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { default as SftpClient, ConnectOptions } from "ssh2-sftp-client"
import { ConnectConfig } from "ssh2"

declare module "@ioc:Adonis/Core/Drive" {
  export type SftpConnectionOptions = ConnectOptions & ConnectConfig

  /**
   * Configuration accepted by the sftp driver
   */
  export type SftpDriverConfig = SftpConnectionOptions & {
    driver: "sftp"
  }

  /**
   * The sftp driver implementation interface
   */
  export interface SftpDriverContract extends DriverContract {
    name: "sftp"
    adapter: SftpClient
    connect(): Promise<void>
    disconnect(): Promise<void>
  }

  interface DriversList {
    sftp: {
      implementation: SftpDriverContract
      config: SftpDriverConfig
    }
  }
}
