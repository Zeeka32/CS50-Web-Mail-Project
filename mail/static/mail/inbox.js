document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#reply').addEventListener('click', reply);
  document.querySelector('#archive').addEventListener('click', archive);
  document.querySelector('#unarchive').addEventListener('click', unArchive);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector("#compose-form").onsubmit = () => {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then((response) => {
      
      if(response.status === 201) {
        load_mailbox('sent');
      }

    });
    
    return false;
  }


});

function archive () {
  emailID = document.querySelector('#reply').dataset.mailid;
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(() => load_mailbox('inbox'));

}

function unArchive () {
  emailID = document.querySelector('#reply').dataset.mailid;
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(() => load_mailbox('inbox'));


}

function reply() {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  emailID = document.querySelector('#reply').dataset.mailid;

  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {

      // ... do something else with email ...
      document.querySelector('#compose-recipients').value = email.sender;

      if(email.subject.includes("Re:")) {
        document.querySelector('#compose-subject').value = email.subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} replied To:\n ${email.body}`;
      } else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value = `${email.body} was Written by ${email.sender} On ${email.timestamp}`;
      }

  });


}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mail(emailID) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })


  fetch(`/emails/${emailID}`)
  .then(response => response.json())
  .then(email => {

      // ... do something else with email ...
      document.querySelector('#mail-from').innerHTML = email.sender;
      document.querySelector('#mail-to').innerHTML = email.recipients;
      document.querySelector('#mail-subject').innerHTML = email.subject;
      document.querySelector('#mail-body').innerHTML = email.body;
      document.querySelector('#mail-date').innerHTML = email.timestamp;
      document.querySelector('#reply').dataset.mailid = emailID;

      if(email.archived === false) {
        document.querySelector('#archive').style.display = 'block';
        document.querySelector('#unarchive').style.display = 'none';
      }else {
        document.querySelector('#archive').style.display = 'none';
        document.querySelector('#unarchive').style.display = 'block';
      }

  });

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  document.querySelector("#emails-list").innerHTML = "";


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      // Display emails 
      emails.forEach(email => {

        let button = document.createElement("button");
        button.classList += "list-group-item";
        if(mailbox == 'sent') {
          button.innerHTML = `To <strong>${email.recipients}</strong> About ${email.subject} on ${email.timestamp}`;
        }else {
          button.innerHTML = `From <strong>${email.sender}</strong> About <strong>${email.subject}</strong> on <strong>${email.timestamp}</strong>`;
        }
        
        button.addEventListener('click', () => load_mail(email.id));
        document.querySelector("#emails-list").appendChild(button);

        if(email.read === true && mailbox !== 'sent') {
          button.classList += " read";
        }else {
          button.classList += " notRead";
        }
        
      });

  });

}
