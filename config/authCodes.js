const authCodes = {
  // TODO: add automated code generation
  admin: {
    create: "CAD",
    read: "RAD",
    update: "UAD",
    delete: "DAD",
    readOne: "ONE_RAD",
    readByCompany: "BYCOMPANY_RAD",
  },
  album: {
    create: "CAL",
    read: "RAL",
    update: "UAL",
    delete: "DAL",
    manageAlbumPhotos: "XAL", // Non-standard code
    readOne: "ONE_RAL",
    readByCompany: "BYCOMPANY_RAL",
  },
  auth: {
    create: "CAU",
    read: "RAU",
    update: "UAU",
    delete: "DAU",
  },
  church: {
    create: "CCH",
    read: "RCH",
    update: "UCH",
    delete: "DCH",
    readByCompany: "BYCOMPANY_RCH",
    readOne: "ONE_RCH",
  },
  company: {
    create: "CCO",
    read: "RCO",
    update: "UCO",
    delete: "DCO",
    readOne: "ONE_RCO",
  },
  event: {
    create: "CE",
    read: "RE",
    update: "UE",
    delete: "DE",
    readByCompany: "BYCOMPANY_RE",
    readOne: "ONE_RE",
  },
  eventRegistration: {
    create: "CER",
    read: "RER",
    update: "UER",
    delete: "DER",
    readByCompany: "BYCOMPANY_RER",
    readOne: "ONE_RER",
  },
  permission: {
    create: "CPE",
    read: "RPE",
    update: "UPE",
    delete: "DPE",
    readByCompany: "BYCOMPANY_RPE",
    readOne: "ONE_RPE",
  },
  photo: {
    create: "CPH",
    read: "RPH",
    update: "UPH",
    delete: "DPH",
    readByCompany: "BYCOMPANY_RPH",
    readOne: "ONE_RPH",
  },
  role: {
    create: "CR",
    read: "RR",
    update: "UR",
    delete: "DR",
    readByCompany: "BYCOMPANY_RR",
    readOne: "ONE_RR",
  },
  rolePermission: {
    create: "CRP",
    read: "RRP",
    update: "URP",
    delete: "DRP",
    manageRolePermissions: "XRP", // Non-standard code
    readByCompany: "BYCOMPANY_RRP",
    readOne: "ONE_RRP",
  },
  team: {
    create: "CT",
    read: "RT",
    update: "UT",
    delete: "DT",
    readByCompany: "BYCOMPANY_RT",
    readOne: "ONE_RT",
  },
  user: {
    create: "CU",
    read: "RU",
    update: "UU",
    delete: "DU",
    readByCompany: "BYCOMPANY_RU",
    readOne: "ONE_RU",
  },
};

module.exports = authCodes;