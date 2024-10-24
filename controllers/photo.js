exports.get = async (req, res) => {
  res.status(200).send({
    message: "photo get",
  })
}

exports.post = async (req, res) => {
  res.status(200).send({
    message: "photo post",
  })
}

exports.put = async (req, res) => {
  res.status(200).send({
    message: "photo put",
  })
}

exports.delete = async (req, res) => {
  res.status(200).send({
    message: "photo delete",
  })
}

exports.getOne = async (req, res) => {
  res.status(200).send({
    message: "photo getOne",
  })
}