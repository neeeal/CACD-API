exports.get = async (req, res) => {
  res.status(200).send({
    message: "team get",
  })
}

exports.post = async (req, res) => {
  res.status(200).send({
    message: "team post",
  })
}

exports.put = async (req, res) => {
  res.status(200).send({
    message: "team put",
  })
}

exports.delete = async (req, res) => {
  res.status(200).send({
    message: "team delete",
  })
}

exports.getOne = async (req, res) => {
  res.status(200).send({
    message: "team getOne",
  })
}