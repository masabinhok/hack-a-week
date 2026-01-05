# IDEAS/DISCUSSIONS
1. Initially create offices with primary data and null fields, later crowd source data, either each office will update their own data, or through user feedbacks + contributions.
2. Prompt user for two type of locations, convenient or permanent as the service demands, this will be one-time. We will store the data on local-storage or in the database with their device details. We might add user-login to store their data permanently with phone number verification.
3. Introduce authentication for users and admins. We can store user information, enable feedbacks/contributions. Admin can verify those, and manage data. Admin control could be given to different government offices.
4. Integrate google-maps ? calendar APIs for holidays ? 

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
10. super_admin feature, office can claim service, and req to create a new one if not available. 

<!-- darlagdo feature -->
1. location anusar distance liyera nearby office locate garne




<!-- maile birse vani -->
1. tyo email halka change garnu paryo
2. office admin ko username generation change gARNY OPARYO TO MAINTAIN UNIQUENESS
3. ✅ OFFICE CREATION MA ID AUTO GENERATE IMPLEMENTED! Backend le category ko abbreviation + count use garera office ID generate garxa (e.g., DAO-1, WARD-1)
4. ✅ office create/edit garda location fetch fixed! All 4-level cascading dropdowns properly load existing data and fetch dependent locations. Profile page pani fixed!
5. ✅in each office profile for the super admin, we should add a send credentials button so that we can send them the credentials even after office creation maybe with a new password!!
6. service independetly exist, ani offices can claim services, if they provide that service, officeadmins can see all the services, and also can request to create a new service to the superadmin!!



<!-- feri kura garau -->
1. officeType fix
2. permanent: euta/convenient : list of office dekhaune...
3. data modelling + data filling
4. embedding model integrate, service mapping...
<!-- admin panel -->
1. superAdmin -> monitors officeAdmin, create global services, create offices
2. officeAdmin -> update/ own office, crud own service -> request for review -> see list of global service and claim the ones they provide!, 

<!-- services -->'
1. officeAdmin le ni afule claim gareko service, wa garna lageko service ko full details herna paunu paryooo
2. superadmin le verify garna ko lagi entire service detail herna paunu paryoo, 
 -->



<!-- our app flow: demo presentation ma k k kura garne ta? -->