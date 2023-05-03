import { Timeframe } from '../models/user.model.js';
/**
 * Calculates the date that the timeframe starts at. Supported timeframes
 * are: ALL, YEAR, MONTH, WEEK.
 * @example timeframe = Timeframe.MONTH // Returns the date 1 month ago.
 * @param timeframe The timeframe to get the start date for.
 * @returns
 */
const getTimeframeStartDate = (timeframe: Timeframe): Date => {
  let datetime = new Date();
  datetime.setHours(0, 0, 0, 0);
  switch (timeframe) {
    case Timeframe.ALL:
      datetime.setFullYear(2022);
      break;
    case Timeframe.YEAR:
      datetime.setFullYear(datetime.getFullYear() - 1);
      break;
    case Timeframe.MONTH:
      datetime.setMonth(datetime.getMonth() - 1);
      break;
    case Timeframe.WEEK:
      datetime.setDate(datetime.getDate() - 1);
      break;
  }
  return datetime;
};

export default getTimeframeStartDate;
