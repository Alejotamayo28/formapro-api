
export const getNumberOfPages = (totalNumberOfRows = 0, limit: number) => {
  if (limit === 0) {
    return 0;
  }

  return Math.ceil(totalNumberOfRows / limit);
};
