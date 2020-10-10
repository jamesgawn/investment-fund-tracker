import Logger from "bunyan";

export class LoggerHelper {
  log: Logger;
  constructor(logger: Logger, childName: string) {
    this.log = logger.child({
      child: childName
    });
  };

  info(msg: string, data?: any) {
    if (data) {
      this.log.info({
        data: data
      }, msg);
    } else {
      this.log.info(msg);
    }
  }

  error(msg: string, err?: Error, data?: any) {
    if (data) {
      this.log.error(err, msg, {
        data: data
      });
    } else {
      this.log.error(err, msg);
    }
  }
}
