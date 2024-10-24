exports.get = async (req, res) => {
  res.status(200).send({
    message: "event get",
  })
}

exports.post = async (req, res) => {
  res.status(200).send({
    message: "event post",
  })
}

exports.put = async (req, res) => {
  res.status(200).send({
    message: "event put",
  })
}

exports.delete = async (req, res) => {
  res.status(200).send({
    message: "event delete",
  })
}

exports.getOne = async (req, res) => {
  res.status(200).send({
    message: "event getOne",
  })
}