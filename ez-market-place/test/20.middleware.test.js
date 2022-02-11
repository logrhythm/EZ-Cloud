const path = require('path');
const httpMocks = require('node-mocks-http'); // quickly sets up REQUEST and RESPONSE to be passed into Express Middlewares

// Define the base directory name of the process
process.env.baseDirname = process.env.baseDirname || path.join(__dirname, '..');

const middlewares = require('../src/middlewares');

let request = {};
let response = {};

// Set of good and bad values for the `ez-publisher` HTTP Header
const ezPublisherHeaderValues = [
  {
    good: true,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8:2748491',
    encrypted: 'Sx5y/3QOohIyC0QAvOVfIDVAMNrQyQeQmp9/Z5fdG9vK2adu5eyaEPTqBYSdnWhns9hXD/FaOM1sGzZdctiViVLJE1vtklx4A/ktRJdMAJW68kKNyE9DnbVGjEmzdSBcYBF/6gYNCqX8vWYeR9Hrnbp0ZZJXU7fl2GmONf1VFNu+p+rJdOW53lgCkaeLqFpBE/2NbaoHykD9ZggT60xd2VM2bNfOoLvdsvtyN0/zIuuxmdvGoKlIO6wJ7Hndb4yR8uRmk4ueKBr1+zigdkyuKFCo0jqLd97YCmYMa19fWE76JXkum7XzOXcxhs4cHhEklzRqEA1bjsldMRlwKq42wA=='
  },
  {
    good: true, // Kind of, as there is an extra value. But it will be ignored, so all good.
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8:2748491:123',
    encrypted: 'uljv+EpDif5jmsoZ2lE4JJq/nvsS2LLYoxGNjBNuV2am/4CmUJq/WlKf8sUcxaIASJQUio+qJlza3KZad+vAFFpH/MmcMrz3dFri8za1luxHFhzUdmwNcXR04eNAN+iRIQhjwCdHapo3/Dt4MKsm9AUgYHnM2g2NtKLqYxmEXKX13JP8aT5UaOAV7NvfBInJ7Mb91Z41FokMg5qQVPnAe02PqahRAH5e7c8JZY0b3NoiPkrLvg1WjvlIBtEBfKFa8NbLy5WZmyWOB/c0cBNzBgDOE07OsFDID92lwJYqO/b33rYq+dqYZIW+99uSpwE0yYMFK0Zj7zWUDFhn8L+nGw=='
  },
  {
    good: false,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8:',
    encrypted: 'tAbMj5TBJQ5dk9hZGgo9yDsL/u+f3Q6lwFcf58fnzwBP1jxS7TF6tY1VcDrFDhiRWoAq2WR1GBpuJP54thsAG9kIDg3/ywe783XL0YbewRkHQKt4aDOlFdTQmQfC5Mdq/l2B4MRxlwjPIBxUYv1EQH7Z1sSie3DaWu4uWGS93Y5L70FWcD5231Ql2l+8bygA0hGVmOa6hUTzq3hS5jHUoTisSbbisO3HpxttO9iCLg4b+kh5fKoGai28hs4ulzWH3QEezOjUCTkcuJ9ZQu/OnAbF0Y6Qu9QMuCb3uFidg9qFH3hloSVbCKk/Rr+0bxPZRvlPHh1mYvJCsHpbs7hbbg=='
  },
  {
    good: false,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8:null',
    encrypted: 'wcd6YSHzySF85YAmzPvUT0uNF2Zww24bo3dYt5uPEL02+tsgkPv/VBrO+0rLwMxcj3kykE2l6Yhdk4zjqjufdV9hJtuBdZ/jVMsuJ7doSAZqCnLGCBg1T3nExaPm4VKNlxm2q8po6w8fMJAzGDW/7/Q9F5MO7t/JBAc3Ymvj9ruH12rDZcUDYhbhaG+SJJ6b3hCWbUHQq/MvFul09sG+6l+CaftFTbRGy4z/5+gT3/ybSEXAac10m3GcfTavpydGnljrJVXdCX+PivY9nhalfJDtYutmrsxJoJ68NRDDEItrZGLc8nbllHXgPH8r6mFSMsL1WrbGJVphJm/7yjZ3Gw=='
  },
  {
    good: false,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8:',
    encrypted: 'ARui4NLe7NbcfO7oxwZSU6GUV+r8vlZ7T9bl7vNZyK/tJ88MaWPrVwKHoR3YpbFEckKXdPvoxhX3gIt4tvA5BmrRfGO44CJZKwQNQf/uyIXYc5fzohyg/9h6djLT4L7wERTt3dk30sIDWYoWb5NTDQei8SMst0YGtjtJ8BYTsyDV69fSx1WtiYMm6pZPEYHAvxRBsfYxom67psw/LHlP8wJiwPWA4xJOW3BAjM7Avy/q77sQE2pfmT4VNgVUkyxOC1E61yeFnOX3deOqIy1LbJAoD4hqi4oRTh8Bxs+iowkX/TQvGqhCF0wrTQubXeE3fEsioknZpCLNXpaFzov4Qw=='
  },
  {
    good: false,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773:e9fa06e1-8c6d-4dde-bd03-c7de96a24cd8',
    encrypted: 'erkHMmweESzGOxbNpGDX8T+o6P07vAiInQmaSdxPQFxI0H5qJCsLw+YbpGbWcIn/Js06dXrr50GGyGBfjkbk9948z3SuBnfOVmRCTOdct/jsz2TRpYNppEdUstq+mGVf6U0sSjSr++7fujf8/+vHPKVoO/9xuO+3U+a2LsFY15Wk8gBBFfD97aPJtDFkZHfisrq/UpbjN+OeRrZqjhylp09DdzfT6z0rjizsToUr5yLeiP2G5yy/ABsi3y6t9cGBIA8r0itz9FnunrTTCAJdt4q9F/DpbcWobQSFjFNqF78HAK6KxgLaZc7VpQN4BNlB/YZfaujDa38xkAgkLgKiGw=='
  },
  {
    good: false,
    clear: '39523fc5-7ab6-460a-a7b5-7f9159aff773::2748491',
    encrypted: 'kbGEt4fRsIBv8Pwq2ZitJrWZZb4oOedvSrIjer4vYqrf1umDRoIfsryx3hbqE89yKrx+DRM6T/4tW4G7NY5n0g8XwRBwImx//9XYKED8LBzT7omfEDdB0G3JFwjYf5vpMRAXlWAnw7XqXv7MoLaeAYwa7/R8by4mc7QMujk3Yoas48aZw67WHEGdpa0si+nEeqDREhNI8py0GcWCDOI0e+oUFhgYlF3dBXv2PSzHOvWSJDKfVO8XpHoWHoJhFI0Su5ThLxW/LjVqzehFOjZlBLKpjuPCvEeDzXCivgOm7Q88mj4rn9mrsWd6BylpHR5Mzoeo+UuR0rXIA7P1muT5Aw=='
  },
  {
    good: false,
    clear: '::',
    encrypted: 'hW5aQBLx4QnOUzM+I4H5odb1UHX9aJDMIo79Ar6EsDm/7OPX/iTbKeTfbWFXUcFglp7FT/A4xO3mXwtA4upm4K8qtbS6RBs2+HXzXfRihgbnVKVc8sSCIRFeY+rKxJq7XR26U58qW3e7A6wq93IEWRI02qSOKq9rnFIGlNghJ24uTirwyLztVz1CvCCMQjQAsgk0WCqbRcDD/HrlUnmxKxr0QjaTou/ZOu7+20SJKq530ZTi9PZQGI5/hxoacg2YnGI5eAdvKcrnhsRoHmJDZ1ubBChKTmWHEURk8aAHxXwRDJJ3DOuFBeyYZJZpoIT828285X/PJCIBnuF3UX7IQQ=='
  },
  {
    good: false,
    clear: '',
    encrypted: 'Blb/zmuviGgpknrKmxRkeBd3oRu8lA3Uyei7cruahyvc7/s+YcCLstUVUPB06Q/Y5mbEEyOFVFInvsUpRpfagzXWjj1phzq0kbM6i4GvP4mT9BF4JL9hl/l1/sIjB5qJuhNiXKHv17GQ1o9dcSiRfUgincFJPEben6p2OIL8ns+vDyhiRmwrZhu1wepB94rAE6WlK3jkbHhsHad7M2doaOUYGBtH2J5PBV/zDN+PEgL7SwVi/UQHRerYBBquCUXE48eCpq5PelqP/O31iz6zxqEhmpzumB5p/4sCCTlTdKg73yxDl//hiob6NApca+KBDRK9lUh8NUBZ7kmNDWN/cA=='
  }
];

describe('Middlewares test', () => {
  context('Deployment and Publisher UIDs and Master ID are extracted from HTTP Headers and match defined schema (middlewares.extractDeploymentAndPublishUids)', () => {
    beforeEach((done) => {
      /**
       * before each test, reset the REQUEST and RESPONSE variables
       * to be send into the middle ware
       */
      request = httpMocks.createRequest({
        headers: {
          'ez-publisher': 'EhrEJMHUHdwC0gTonRU8HCLIJm/OIzaxT1fqAvOL9iG0ejbz05YGp1NsbGWfw0/5gKPnWTZxoZQxcle6X+ddAse1b1M/b10ydnDRIa015+reXvOwq7KifRRoAlKmme89Ez4au6brpwzMvhrwn/0XygVzVY5401rUeX0mf6MilY/9Ulk2cCK2i4cotgbZcsyNxondKz3ZvGEhKz/8D+QDghslp3BjKz9BoDTcAnhFJkYrmBWm8Umb+XYKL3YuxvClZiS7iXp83gSoS/3K1asAz0pEwRKygexvnsoz6uUiGVv4cqFlWKkaZD9HOqe+ZahuHbkjLkc5t8ss0MI8sJw8vg=='
        },
        method: 'GET',
        url: '/api/v1'
        // query: {
        //   myid: '312'
        // }
      });
      response = httpMocks.createResponse();

      done(); // call done so that the next test can run
    });

    // encryptedEzPublisherValues.forEach()
    ezPublisherHeaderValues.forEach(ezPublisherHeaderValueToTest => {
      it(`${(ezPublisherHeaderValueToTest.good ? 'extract' : 'discard')} Deployment and Publisher UIDs and Master ID - ${(ezPublisherHeaderValueToTest.good ? 'Acceptable' : 'Unacceptable')} value: "${ezPublisherHeaderValueToTest.clear}"`, (done) => {
        request.headers['ez-publisher'] = ezPublisherHeaderValueToTest.encrypted;
        /**
         * Middlewares expects to be passed 3 arguments: request, response, and next.
         * We are going to be manually passing REQUEST and RESPONSE into the middlewares
         * and create an function callback for next in which we run our tests
         */
        middlewares.extractDeploymentAndPublishUids(request, response, (error) => {
          // console.log('request.headers[\'ez-publisher\']:', request.headers['ez-publisher']);
          // console.log('request.ezPublisherHeader:', request.ezPublisherHeader);
          /**
           * Usually, we do not pass anything into next except for errors, so because
           * in this test we are passing valid data in REQUEST we should not get an
           * error to be passed in.
           */
          if (error) {
            throw new Error('Expected not to receive an error');
          }

          // Validate the Header is properly extracted
          const ezPublisherHeaderExtractedAndValid = Boolean(
            request.ezPublisherHeader.deploymentUid
            && request.ezPublisherHeader.deploymentUid.length
            && request.ezPublisherHeader.publisherUid
            && request.ezPublisherHeader.publisherUid.length
            && Number.isInteger(request.ezPublisherHeader.masterId)
          );
          // eslint-disable-next-line max-len
          // console.log('ezPublisherHeaderExtractedAndValid / ezPublisherHeaderValueToTest.good', ezPublisherHeaderExtractedAndValid, ezPublisherHeaderValueToTest.good);

          if (ezPublisherHeaderExtractedAndValid !== ezPublisherHeaderValueToTest.good) {
            throw new Error('Headers not parsed and sanitised properly');
          }

          done(); // call done so we can run the next test
        }); // close middlewares
      }); // close it
    });
  }); // close context
}); // close describe
