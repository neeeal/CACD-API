exports.login = async (req, res) => {
  res.status(200).send({
    message: "auth login",
  })
}
exports.logout = async (req, res) => {
  res.status(200).send({
    message: "auth logout",
  })
}

exports.refresh = async (req, res) => {
  res.status(200).send({
    message: "auth refresh",
  })
}