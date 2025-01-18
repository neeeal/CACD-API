// const TicketsCol = require("../models/tickets.js");
// const utils = require("../helpers/utils.js");
// const moment = require("moment");

// // TODO: add batch delete service

// exports.get = async (req, res) => {

//   const queryParams = req.query || {};

//   let data;
//   try{
//     const query = utils.queryBuilder({
//       initialQuery: { deletedAt: null },
//       queryParams: queryParams
//     });

//     data = await utils.getAndPopulate({
//       query: query,
//       col: TicketsCol,
//       offset: queryParams.offset,
//       limit: queryParams.limit
//     });
//   } catch (err) {
//     console.error(err.stack);

//     if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
//       return res.status(404).send({ error: "Invalid ObjectId" });
//     }

//     return res.status(500).send({ error: "Server error" });
//   }


//   res.status(200).send({
//     message: "ticket get",
//     data: data || [],
//     count: data && data.length
//   })
// }

// exports.getOne = async (req, res) => {
//   const user = req.user;

//   let data;
//   try{
//     const query = { deletedAt: null, _id: user.ticket, company: user.company };

//     data = await utils.getAndPopulate({
//       query: query,
//       col: TicketsCol,
//     });
    
//   } catch (err) {
//     console.error(err.stack);

//     if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
//       return res.status(404).send({ error: "Invalid ObjectId" });
//     }

//     return res.status(500).send({ error: "Server error" });
//   }

//   res.status(200).send({
//     message: "Tickets get",
//     data: data?.[0] || [],
//     count: data && data.length 
//   })
// }

// exports.getByCompany = async (req, res) => {
  
//   const queryParams = req.query || {};
//   const user = req.user;

//   let data;
//   try{
//     const query = utils.queryBuilder({
//       initialQuery: { deletedAt: null, company: user.company },
//       queryParams: queryParams,
//     });

//     data = await utils.getAndPopulate({
//       query: query,
//       col: TicketsCol,
//       offset: queryParams.offset,
//       limit: queryParams.limit
//     });
    
//   } catch (err) {
//     console.error(err.stack);

//     if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
//       return res.status(404).send({ error: "Invalid ObjectId" });
//     }

//     return res.status(500).send({ error: "Server error" });
//   }

//   res.status(200).send({
//     message: "User get",
//     data: data || [],
//     count: data && data.length 
//   })
// }

// exports.post = async (req, res) => {
//   const newTicket = req.body;
//   const uploadedPhotos = req.files;

//   console.log(uploadedPhotos)

//   if (uploadedPhotos && uploadedPhotos.length) {
//     try{
//       const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newTicket});
//       newTicket.photos = savedPhotos;
//     }
//     catch (err){
//       console.error(err.stack);
//       return res.status(500).send({ error: "Server error" });
//     }
//   }

//   const values = {
//     ...newTicket,
//     photos: newTicket.photos || [],
//     ticketId: utils.generateUUID()
//   }

//   console.log(values)
  
//   let data;
//   try{
//     const newTicketDoc = new TicketsCol(values);
//     console.log(newTicketDoc)
//     data = await utils.saveAndPopulate({doc:newTicketDoc, col:TicketsCol});
//   }
//   catch (err){
//     console.error(err.stack);
//     return res.status(500).send({ error: "Server error" });
//   }

//   res.status(200).send({
//     message: "ticket post",
//     data: data
//   })
// }


// exports.put = async (req, res) => {
//   let newTicket = req.body;
//   const uploadedPhotos = req.files;

//   const query = {
//     _id: newTicket.OID,
//     deletedAt: null
//   }

//   try{
//     newTicket = await utils.managePhotosUpdate({
//       col: TicketsCol,
//       query: query,
//       uploadedPhotos: uploadedPhotos,
//       newDoc: newTicket
//     });
//   } catch(err){
//     console.error(err.stack);
//     return res.status(500).send({ error: "Server error" });
//   }

//   const values = {
//     $set: {
//       ...newTicket
//     }
//   }

//   const options = { 
//     new: true
//   }

//   try{
//     newTicket = await utils.updateAndPopulate({ query: query, values: values, options: options, col: TicketsCol });
    
//     if (!newTicket) 
//       throw new Error("Ticket not found");

//   } catch (err){
//     console.error(err.stack);

//     if (err.message.includes("not found"))
//       return res.status(404).send({ error: err.message });

//     if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
//       return res.status(404).send({
//       error: "Invalid Object ID"
//     });

//     return res.status(500).send({ error: "Server error" });
//   }

//   res.status(200).send({
//     message: "ticket put",
//     data: newTicket
//   })
// }

// exports.delete = async (req, res) => {
//   const { OID } = req.params; 

//   let ticketDoc;
//   try {
//     ticketDoc = await TicketsCol.findOneAndUpdate(
//       { 
//         _id: OID, 
//         deletedAt: null
//       },
//       {
//         $set: {
//           deletedAt: moment().toISOString()
//         }
//     }
//   );
//   } catch (err){
//     console.error(err.stack);

//     if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
//       return res.status(404).send({
//       error: "Invalid Object ID"
//     });

//     return res.status(500).send({ error: "Server error" });
//   }

//   if (!ticketDoc) {
//     return res.status(404).send({ error: "Ticket not found" });
//   }
  
//   res.status(200).send({
//     message: "Ticket deleted",
//     data: {
//       OID: OID
//     }
//   })
// }