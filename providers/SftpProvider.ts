/*
 * @adonisjs/drive-gcs
 *
 * (c) Luciano Meniconi <luciano.meniconi.r@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { SftpDriver } from "../src/Drivers/Sftp"
import { ApplicationContract } from "@ioc:Adonis/Core/Application"

export default class SftpProvider {
  constructor(protected app: ApplicationContract) {}

  public boot() {
    this.app.container.withBindings(["Adonis/Core/Drive"], (Drive) => {
      Drive.extend("sftp", (_, __, config) => {
        return new SftpDriver(config)
      })
    })
  }
}
