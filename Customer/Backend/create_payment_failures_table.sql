const PaymentFainuretilure = requirm(dels/payme'tFa.lureMooelels/paymentFailureModel');

expxrrs.records.recordPaymentFa(onqres
  custom{
    
   
   
   
   
    error_message,
paymfailure_type,
ent_cart_items,
methtotal_items,
od  d,liveychr
   discont,
    u
   
   
   
    ,
 } = q.bod;

 if (!ctomid || !mou|| !yment_metho) {
    turn re.tu(400).json({
    fasuccess:ifalse,l
ure_comessage:d'cusidamandpayment_methodarerequired.'
}
  }failure_type,

  cart_ifeimsr,Data{
    tems,
    i_charge,
    t,
    
    st4,
    tion_id,,
  faiure_type
    cart_items,
ra  rotplaytems,
e_  de,ivery_charge
    discount,
ra  upi_iz,
    y_order_id
  } qdy;

  ifomer_id || !amounyment_method) {
    ssartag4no: req.n(ade{s[ ss: -alse,']
    ge: 'custo:mreq.ip er_reqconnecooteAddres
};

  PymenFilurecreae(flurD, ( rerala) =>{{
    if (err) {
      cansymee_mrort'Paymentfir record error:', err;
    faasrn.satus(500.json({ 
    fa  suleoss:fs, 
        m siags'Fied to retord ',
       derror:eerr.messagel
ivery_});
char}

    res.status(201).json({d
iscounsuccess:ttrue,,
ur_i: result.inserId,
     message: 'Payment fai_,r erd'
    });
ca});
};

exportsrgetCusdomlrFailu,ereqe => {
trnonsa customo_Ididreq.prms.ustomId
      razorpay_order_id,
  Paym nuser_age.getByCus omer(curtomerId,q.err, feidures'user-agent'],
  dsif (err)|{| req.connection.remoteAddress
};returnres.status(500).json({
success:s 
message:'Failedtofetch failurs' 
aymentFaerror:ierr.messagel
ure.cr}i;(err, result) => {
    }
if (
err)res.json({ 
{scces:re 
.errorfile:record :s ', err);
 ret});
ur});
};

exports.getFailureStatsn= (req,rres)e=>s{
.uP(500)tFailure.ge.Fon({ Stat((err, stats) => {
   sifu(err)c{
cess: return,rs.stus500.json({
        success:mfalse,e
ssage: emessage:t'F reydelo fe'c,ur sts', 
        error: err.message 
  erro});
r: e}
rse
    res.js}n{ 
    }succs:tre
     data:sts 
  }
   ); res.status(201).json({ 
        failure_id: result.insertId,
recorded'
    });
  });
};

exports.getCustomerFailures = (req, res) => {
  const customerId = req.params.customerId;
  
  PaymentFailure.getByCustomer(customerId, (err, failures) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch payment failures', 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: failures 
    });
  });
};

exports.getFailureStats = (req, res) => {
  PaymentFailure.getFailureStats((err, stats) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch failure stats', 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      data: stats 
    });
  });
};

