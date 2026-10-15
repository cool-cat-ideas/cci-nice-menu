import subprocess,json,re,sys
from pathlib import Path
root=Path('/home/marcin/Development/CCI_DEV/products/cci_nice_menu')
output=root/'output/playwright/grip-hover'
node='/home/marcin/Development/CCI_DEV/scripts/run-node'
wp=r"""<?php
$_SERVER['HTTP_HOST']='localhost:4060';require '/var/www/html/wp-load.php';
$user=get_users(['role'=>'administrator','number'=>1])[0];$expiration=time()+3600;
$token=WP_Session_Tokens::get_instance($user->ID)->create($expiration);
echo json_encode(['id'=>$user->ID,'token'=>$token,'cookies'=>[
['name'=>LOGGED_IN_COOKIE,'value'=>wp_generate_auth_cookie($user->ID,$expiration,'logged_in',$token),'domain'=>'localhost','path'=>'/','httpOnly'=>true,'secure'=>false,'sameSite'=>'Lax'],
['name'=>AUTH_COOKIE,'value'=>wp_generate_auth_cookie($user->ID,$expiration,'auth',$token),'domain'=>'localhost','path'=>'/','httpOnly'=>true,'secure'=>false,'sameSite'=>'Lax']]]);
"""
ps=r"""<?php
$_SERVER['HTTP_HOST']='localhost:4090';$_SERVER['REMOTE_ADDR']='172.28.0.1';
define('_PS_ADMIN_DIR_','/var/www/html/admin478wppcxwat7mpbnah9');
require '/var/www/html/config/config.inc.php';require_once '/var/www/html/app/AdminKernel.php';
$kernel=new AdminKernel('prod',false);$kernel->boot();$em=$kernel->getContainer()->get('doctrine')->getManager();
$employee=$em->find(PrestaShopBundle\Entity\Employee\Employee::class,1);
$owned=new PrestaShopBundle\Entity\Employee\EmployeeSession();$owned->setEmployee($employee)->setToken(bin2hex(random_bytes(20)));$em->persist($owned);$em->flush();
$token=new Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken($employee,'main',$employee->getRoles());
$token->setAttribute('_employee_session',$owned);$token->setAttribute('_ip_address','172.28.0.1');
$token->setAttribute('_shop_constraint',PrestaShop\PrestaShop\Core\Domain\Shop\ValueObject\ShopConstraint::shop(1));
$session=new Symfony\Component\HttpFoundation\Session\Session(new Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage());
$session->start();$session->set('_security_main',serialize($token));$sid=$session->getId();$session->save();
$context=Context::getContext();$context->employee=new Employee(1);$cookie=$context->cookie;
$cookie->id_employee=1;$cookie->id_lang=$context->employee->id_lang;$cookie->email=$context->employee->email;$cookie->passwd=$context->employee->passwd;
$cookie->profile=$context->employee->id_profile;$cookie->shopContext='s-1';$cookie->session_id=$owned->getId();$cookie->session_token=$owned->getToken();
$raw='';foreach($cookie->getAll() as $key=>$value){if($key!=='checksum')$raw.=$key.'|'.$value.'¤';}
$raw.='checksum|'.hash('sha256',_COOKIE_IV_.$raw);$property=new ReflectionProperty(Cookie::class,'cipherTool');$property->setAccessible(true);
$encrypted=$property->getValue($cookie)->encrypt($raw);$cookie->disallowWriting();
echo json_encode(['id'=>$sid,'employeeSessionId'=>$owned->getId(),'employeeToken'=>$owned->getToken(),'cookies'=>[
['name'=>session_name(),'value'=>$sid,'domain'=>'localhost','path'=>'/','httpOnly'=>true,'secure'=>false,'sameSite'=>'Lax'],
['name'=>$cookie->getName(),'value'=>$encrypted,'domain'=>'localhost','path'=>'/','httpOnly'=>true,'secure'=>false,'sameSite'=>'Lax']]]);
"""
def php(container,code):
 result=subprocess.run(['docker','--context','cci-native','exec','-i',container,'php'],input=code,text=True,capture_output=True)
 if result.returncode: raise RuntimeError('Native authentication command failed')
 return result.stdout
for platform,container,source,url in [
 ('wp','cci-wordpress-demo-app-1',wp,'http://localhost:4060/wp-admin/admin.php?page=cci-product-inquiry'),
 ('ps','cci-prestashop-demo-app-1',ps,'http://localhost:4090/admin478wppcxwat7mpbnah9/index.php?controller=AdminCciNiceMenu')]:
 if len(sys.argv)>1 and platform != sys.argv[1]: continue
 auth=None;config=output/(platform+'-browser.json');profile='nice-menu-grip-hover-'+platform
 def cli(*args):
  result=subprocess.run([node,'npx','--yes','--package','@playwright/cli','playwright-cli','-s='+profile,*args],cwd=root,text=True,capture_output=True)
  return result.stdout+result.stderr
 try:
  auth=json.loads(php(container,source.replace(chr(92)*2,chr(92))))
  config.write_text(json.dumps({'browser':{'browserName':'chromium','launchOptions':{'headless':True,'executablePath':'/home/marcin/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'},'contextOptions':{'storageState':{'cookies':auth['cookies'],'origins':[]}}}}));config.chmod(0o600)
  opened=cli('open',url,'--config',str(config))
  if '### Error' in opened: raise RuntimeError('Browser open failed')
  if platform=='ps':
   resolved=cli('run-code','async page => { const warning = page.getByRole("link", {name:"I understand the risk",exact:true}); if (await warning.count()) await warning.click(); return {loaded: await page.locator("#cci-nice-menu-admin-root").count()}; }')
   if '### Error' in resolved: raise RuntimeError('Native PrestaShop navigation failed')
  script=output/'check.js'
  result=cli('run-code',script.read_text())
  (output/(platform+'-toolbar-checks.log')).write_text(result)
  match=re.search(r'### Result\s*([\s\S]*?)\n###',result)
  if '### Error' in result or not match: raise RuntimeError(platform+' alignment checks failed; see private local test log')
  data=json.loads(match.group(1));print(platform+': '+json.dumps({'passed':data.get('checks',0), 'errors':data.get('errors',[])}),flush=True)
 finally:
  cli('close')
  if auth:
   if platform=='wp':
    assert re.fullmatch(r'[a-zA-Z0-9]+',auth['token'])
    cleanup="<?php require '/var/www/html/wp-load.php'; WP_Session_Tokens::get_instance("+str(int(auth['id']))+")->destroy('"+auth['token']+"');"
   else:
    assert re.fullmatch(r'[a-zA-Z0-9]+',auth['employeeToken']) and re.fullmatch(r'[a-zA-Z0-9,-]+',auth['id'])
    cleanup=f"""<?php require '/var/www/html/config/config.inc.php'; Db::getInstance()->delete('employee_session', "id_employee_session={int(auth['employeeSessionId'])} AND id_employee=1 AND token='{auth['employeeToken']}'"); session_id('{auth['id']}'); session_start(); session_destroy();"""
   php(container,cleanup)
  if config.exists():config.unlink()
