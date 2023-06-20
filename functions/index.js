// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");
admin.initializeApp();

// register user
exports.newUserSignUp = functions.auth.user().onCreate(async (user) => {
  return await admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    isAdmin: false,
    surveysTaken: []
  });
});

// get users
exports.getUsers = functions.https.onCall(async (data, context) => {
  const snapshots = await admin.firestore().collection("users").get();
  const list = snapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return list;
});

// get user
exports.getUser = functions.https.onCall(async (data, context) => {
  const users = await admin
    .firestore()
    .collection("users")
    .where('email', '==', data.email)
    .get();

  const arr = []

  for(let user of users.docs) {
    arr.push({...user.data(), id: user.id})
  }

  return arr[0];
});

// get survey
exports.getSurvey = functions.https.onCall(async (data, context) => {
  const survey = await admin
    .firestore()
    .collection("survey")
    .doc(data.id)
    .get();
  return survey.data();
});


// add survey
exports.addSurvey = functions.https.onCall(async (data, context) => {
  const { title, desc } = data;
  await admin.firestore().collection("survey").add({
    title,
    desc,
    createdAt: new Date(),
  });
  return "Survey added";
});

// updateSurvey Details
exports.updateSurveyDetails = functions.https.onCall(async (data, context) => {
  const { title, desc, id } = data;
  await admin.firestore().collection("survey").doc(id).update({
    title,
    desc
  });
  return "Survey details updated";
});


// add question and answer to survey
exports.addQuestionAndAnswer = functions.https.onCall(async (data, context) => {
  const addedQuestion = await admin.firestore().collection("question").add({
    surveyId: data.surveyId,
    question: data.question,
    questionType: data.questionType,
    createdAt: new Date()
  });

  if (data.questionType === "3" || data.questionType === "4") {
    await admin.firestore().collection("answer").add({
      questionId: addedQuestion.id,
      answer: "",
      createdAt: new Date()
    });
  } else {
    data.labels.forEach(async (item) => {
      await admin.firestore().collection("answer").add({
        questionId: addedQuestion.id,
        answer: item.answer,
        createdAt: new Date()
      });
    });
  }
  return "survey question added";
});

// delete questions
exports.deleteQuestionsAndAnswers = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }

  const question = await admin.firestore().collection('question').doc(data.id).get();
  const answers = await admin.firestore().collection('answer').where('questionId', "==", question.id).get();

  await admin.firestore().collection('question').doc(data.id).delete(); 

  for(let answer of answers.docs) {
    await admin.firestore().collection('answer').doc(answer.id).delete();
  }
  
  return "question deleted";
});

// get questions
exports.getQuestionsAndAnswers = functions.https.onCall(
  async (data, context) => {

    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated', 
        'only authenticated users can vote up requests'
      );
    }

    const survey = await admin
      .firestore()
      .collection("survey")
      .doc(data.id)
      .get();

    const questions = await admin
      .firestore()
      .collection("question")
      .where("surveyId", "==", survey.id)
      .get()

    const resQuestions = [];

    for(let question of questions.docs) {
      const answers = await admin
        .firestore()
        .collection("answer")
        .where("questionId", "==", question.id)
        .get()

      const mapAnswers = answers.docs.map(answer=> {
        return {...answer.data(), id: answer.id}
      })

      resQuestions.push({
        id: question.id,
        question: question.data().question,
        questionType: question.data().questionType,
        labels: mapAnswers
      })
    }

    return resQuestions;
  }
);


// edit survey
exports.editSurvey = functions.https.onCall(async (data, context) => {
  const { title, desc, questions } = data;

  let answers = [];

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }

  const addedSurvey = await admin
    .firestore()
    .collection("survey")
    .add({ title, desc });

  questions.forEach(async (item) => {
    const addedQuestion = await admin.firestore().collection("question").add({
      surveyId: addedSurvey.id,
      question: item.question,
      questionType: item.questionType,
    });

    answers.push(addedQuestion.id);
  });

  return answers;
});

// delete survey
exports.deleteSurvey = functions.https.onCall(async (data, context) => {
  await admin.firestore().collection("survey").doc(data.id).delete();
  return "Survey deleted";
});


// submit user
exports.submitUserSurvey = functions.https.onCall(async (data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }

  for(let item of data.answers) {
    if(item.questionType === "1") {
      for(let answer of item.answer) {
        await admin.firestore().collection("usersAnswer").add({
          userId: data.userId,
          answerId: answer.answerId,
          response: answer.value
         });
      } 
    } 
    else {
      await admin.firestore().collection("usersAnswer").add({
        userId: data.userId,
        answerId: item.answer.answerId,
        response: item.answer.value
       });
    }
  }

  await admin.firestore().collection("submittedSurvey").add({
    surveyId: data.surveyId,
    userId: data.userId,
    submittedAt: new Date()
   });

   const userRef = admin.firestore().collection("users").doc(data.userId)

   const doc = await userRef.get()

   await userRef.update({
    surveysTaken: [...doc.data().surveysTaken, data.surveyId]
   })

  return "User Survey submitted";
});

// survey table report
exports.surveyTableReport = functions.https.onCall(async (data, context) => {

  let totalUserSubmitted = 0
  let totalQuestion = 0

  let newSurveys = []

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }

  const surveyRef = admin.firestore().collection('survey')
  const userSubmittedRef = admin.firestore().collection('submittedSurvey')
  const questionRef = admin.firestore().collection('question')

  const surveys = await surveyRef.get()
  const userSubmittedList = await userSubmittedRef.get()
  const questionList = await questionRef.get()

  for(let survey of surveys.docs) {
    
    for(let userSubmitted of userSubmittedList.docs) {
      if(survey.id === userSubmitted.data().surveyId) {
        totalUserSubmitted+=1
      }
    }

    for(let question of questionList.docs) {
      if(survey.id === question.data().surveyId) {
        totalQuestion+=1
      }
    }

    newSurveys.push({
      id: survey.id,
      totalUserSubmitted, 
      totalQuestion,
      title: survey.data().title,
      desc: survey.data().desc,
    }) 

    totalUserSubmitted = 0
    totalQuestion = 0
  }

  return newSurveys

});


// survey report
exports.getSurveyReport = functions.https.onCall(async (data, context) => {

  let newSurveys = []
  let newQuestions = []
  let newUserAnswer = []

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }

  const surveyRef = admin.firestore().collection('survey')
  const userAnswerRef = admin.firestore().collection('usersAnswer')
  const questionRef = admin.firestore().collection('question')
  const answerRef = admin.firestore().collection('answer')

  const answerList = await answerRef.get()
  const userAnswerList = await userAnswerRef.get()

  const survey = await surveyRef.doc(data.surveyId).get()

  const questionList = await questionRef
    .where('surveyId', '==', data.surveyId)
    .get()

  for(let question of questionList.docs) {
    if(question.data().surveyId === survey.id) {
      for(let answer of answerList.docs) {
        if(answer.data().questionId === question.id) {
          let totalUserAnswer = 0
          let response = ''
          let ratings = []

          for(let userAnswer of userAnswerList.docs) {
            if(userAnswer.data().answerId === answer.id) {
              response = userAnswer.data().response
              totalUserAnswer+=1
              if(question.data().questionType === '4') {
                ratings.push(response)
              }
            }
          }

          if(question.data().questionType === '4') {

            const rate1 = ratings.filter(item=> item === '1').length 
            const rate2 = ratings.filter(item=> item === '2').length 
            const rate3 = ratings.filter(item=> item === '3').length 
            const rate4 = ratings.filter(item=> item === '4').length 
            const rate5 = ratings.filter(item=> item === '5').length 

            const mapArr = [...Array(5)].map((item, i)=> {
              const idx = i + 1

              if(idx === 1) {
                return {
                  id: idx,
                  totalUserAnswer: rate1 || 0,
                  answer: '1',
                }
              }

              if(idx === 2) {
                return {
                  id: idx,
                  totalUserAnswer: rate2 || 0,
                  answer: '2',
                }
              }

              if(idx === 3) {
                return {
                  id: idx,
                  totalUserAnswer: rate3 || 0,
                  answer: '3',
                }
              }

              if(idx === 4) {
                return {
                  id: idx,
                  totalUserAnswer: rate4 || 0,
                  answer: '4',
                }
              }

                return {
                  id: idx,
                  totalUserAnswer: rate5 || 0,
                  answer: '5',
                }
             
            })

            totalUserAnswer = 0
            newUserAnswer = mapArr
            
          } else {
            newUserAnswer.push({
              id: answer.id,
              totalUserAnswer,
              answer: response ? response : answer.data().answer,
            })
            totalUserAnswer = 0
          }
        }
      }
      newQuestions.push({
        id: question.id,
        question: question.data().question,
        questionType: question.data().questionType,
        userAnswers: newUserAnswer
      })
      newUserAnswer = []
    }
  }


  const report = {
    id: survey.id,
    title: survey.data().title,
    desc: survey.data().desc,
    questions: newQuestions
  }


  return report

});


// admin stat
exports.getStats = functions.https.onCall(async (data, context) => {
  const totalSurveys = await admin.firestore().collection("survey").get();
  const totalUsers = await admin.firestore().collection("users").get();

  return {
    totalSurveys: totalSurveys.size,
    totalUsers: totalUsers.size
  }
});



