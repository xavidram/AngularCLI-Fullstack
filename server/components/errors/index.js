module.exports[404] = function pageNotFound(req, res) {
  const viewFilePath = '404';
  const statusCode = 404;
  const result = {
    status: statusCode
  };

  res.status(result.status);
  console.log(viewFilePath)
  res.render(viewFilePath, {}, (err, html) => {
    if (err) {
      return res.status(res.status).join(result);
    }
    res.send(html);
  });
};
