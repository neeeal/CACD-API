exports.get = async (req, res) => {
  res.status(200).send({
    message: "church get",
  })
}

exports.post = async (req, res) => {
  res.status(200).send({
    message: "church post",
  })
}

exports.put = async (req, res) => {
  res.status(200).send({
    message: "church put",
  })
}

exports.delete = async (req, res) => {
  res.status(200).send({
    message: "church delete",
  })
}

exports.getOne = async (req, res) => {
  res.status(200).send({
    message: "church getOne",
  })
}