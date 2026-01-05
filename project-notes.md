# IDEAS/DISCUSSIONS
1. Initially create offices with primary data and null fields, later crowd source data, either each office will update their own data, or through user feedbacks + contributions.
2. Prompt user for two type of locations, convenient or permanent as the service demands, this will be one-time. We will store the data on local-storage or in the database with their device details. We might add user-login to store their data permanently with phone number verification.
3. Introduce authentication for users and admins. We can store user information, enable feedbacks/contributions. Admin can verify those, and manage data. Admin control could be given to different government offices.
4. Integrate google-maps ? calendar APIs for holidays ? 


# API ENDPOINTS
✅ GET /api/v1/services
✅ GET /api/v1/services/:slug
✅ GET /api/v1/sub-services/:slug 
✅ GET /api/v1/locations/provinces
✅ GET /api/v1/offices/nearby/:officeType
✅ GET /api/v1/locations/provinces/:provinceId/districts
✅ GET /api/v1/locations/districts/:districtId/municipalities
✅ GET /api/v1/locations/municipalities/:municipalityId/wards


# QUICK NOTES
1. Kotha steps
2. office associated with their officeAdmin credentials dinxam
3. bilingual
4. local ai model service mapping, 
5. service -> office many to many, each office can claim they provide certain services, if some service has office specific changes, they can add them as an optional attribute, 
<!--  service
officeSpecificChange OfficeSpecificChange 
 -->

 <!--  
 officeSpecificChange
 officeId
 serviceId
 changes: {
    field:kfjdlsafj
    changeSabin
 }
-->
  <!--  we reflect these changes according to user locations. -->
6. add one optional field for daily office notices, 
7. office category and officeType redundant, use officeCategory.
8. user feedback/report ???????
9. nearby offices not limited to his specific ward, location

<!-- darlagdo feature -->
1. location anusar distance liyera nearby office locate garne