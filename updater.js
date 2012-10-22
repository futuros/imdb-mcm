try
{
	function updateCheck(forced)
	{
		if ((forced) || (parseInt(Storage.get('SUC_last_update', '0')) + 86400000 <= (new Date().getTime()))) // Checks once a day (24 h * 60 m * 60 s * 1000 ms)
		{
			try
			{
				GM_xmlhttpRequest(
				{
					method: 'GET',
					url: 'http://userscripts.org/scripts/source/'+Script.id+'.meta.js?'+new Date().getTime(),
					headers: {'Cache-Control': 'no-cache'},
					onload: function(resp)
					{
						var remote_version, rt;					
						rt=resp.responseText;
						
						GM_setValue('SUC_last_update', new Date().getTime()+'');
						remote_version=/@version\s*(.*?)\s*$/m.exec(rt)[1];
						
						if (remote_version > Script.version)
						{
							if(confirm('There is an update available for the Greasemonkey script "'+Script.name+'."\nWould you like to install now?'))
							{
								GM_openInTab('http://userscripts.org/scripts/source/'+Script.id+'.user.js');
							}
						}
						else if (forced)
						{
							alert('No update is available for "'+Script.name+'."');
						}
					}
				});
			}
			catch (err)
			{
				if (forced)
					alert('An error occurred while checking for updates:\n'+err);
			}
		}
	}
	GM_registerMenuCommand(Script.name + ' - Update check', function()
	{
		updateCheck(true);
	});
	updateCheck(false);
}
catch(err)
{}
