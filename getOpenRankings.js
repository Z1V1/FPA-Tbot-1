let axios = require('axios');

let base_url = 'http://www.freestyledisc.org/rankings/';

let getOpenRankings = async function (state='open') {
  let res = await axios.get(base_url);
  //console.log(res.data);
  const start = res.data.indexOf(state=='open'?'http://www.freestyledisc.org/fpa-open-rankings-update':'http://www.freestyledisc.org/fpa-womens-rankings-update');
  //console.log(start);
  const end = res.data.indexOf('" target=', start);
  const link = res.data.slice(start, end);
  //console.log('link = ' + link);
  let res2 = await axios.get(link);
  console.log('end of myGet function');
  //console.log(res2.data);
  const start2 = res2.data.indexOf('<td>1</td>');
  //console.log(start2);
  const end2 = res2.data.indexOf('</tbody>', start);
  let data = res2.data.slice(start2, end2).replace(/<tr>\n/g, "");
  const rankArr = data.split('</tr>');
  const rankArrFormatted = [];
  let rankList = '';

  for (let i = 0; i < rankArr.length - 1; i++) {
    rankArrFormatted[i] = rankArr[i].trim().replace("&#8217;", "'").replace("&#8220;", '"').replace("&#8221;", '"').replace(/<[/]td>/g, "").replace('<td>', '').split('<td>');
    rankList += (rankArrFormatted[i][0].trim() + ': ' + rankArrFormatted[i][2]);

  };
  console.log(rankArrFormatted[0][2]);
  console.log('rank list:');
  //console.log(rankList);
  console.log('end of rank list:');
  return { arr: rankArrFormatted, str: rankList };
}

module.exports.getOpenRankings = getOpenRankings;
