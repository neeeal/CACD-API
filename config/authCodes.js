const authCodes = {
  // TODO: add automated code generation
  admin: {
    create: "CAD",
    read: "RAD",
    update: "UAD",
    delete: "DAD",
    readOne: "CAD_ONE",
    readByCompany: "RAD_BYCOMPANY",
  },
  album: {
    create: "CAL",
    read: "RAL",
    update: "UAL",
    delete: "DAL",
    manageAlbumPhotos: "XAL", // Non-standard code
    readByCompany: "RAL_BYCOMPANY",
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
    readByCompany: "RCH_BYCOMPANY",
  },
  company: {
    create: "CCO",
    read: "RCO",
    update: "UCO",
    delete: "DCO",
  },
  event: {
    create: "CE",
    read: "RE",
    update: "UE",
    delete: "DE",
    readByCompany: "RE_BYCOMPANY",
  },
  eventRegistration: {
    create: "CER",
    read: "RER",
    update: "UER",
    delete: "DER",
    readByCompany: "RER_BYCOMPANY",
  },
  permission: {
    create: "CPE",
    read: "RPE",
    update: "UPE",
    delete: "DPE",
    readByCompany: "RUPE_BYCOMPANY",
  },
  photo: {
    create: "CPH",
    read: "RPH",
    update: "UPH",
    delete: "DPH",
    readByCompany: "RPH_BYCOMPANY",
  },
  role: {
    create: "CR",
    read: "RR",
    update: "UR",
    delete: "DR",
    readByCompany: "RR_BYCOMPANY",
  },
  rolePermission: {
    create: "CRP",
    read: "RRP",
    update: "URP",
    delete: "DRP",
    manageRolePermissions: "XRP", // Non-standard code
    readByCompany: "RRP_BYCOMPANY",
  },
  team: {
    create: "CT",
    read: "RT",
    update: "UT",
    delete: "DT",
    readByCompany: "RT_BYCOMPANY",
  },
  user: {
    create: "CU",
    read: "RU",
    update: "UU",
    delete: "DU",
    readOne: "RU_ONE",
    readByCompany: "RU_BYCOMPANY",
  },
};

module.exports = authCodes;