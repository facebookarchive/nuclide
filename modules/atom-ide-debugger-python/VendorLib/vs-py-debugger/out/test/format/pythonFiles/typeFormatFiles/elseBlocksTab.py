var = 100
if var == 200:
	print "1 - Got a true expression value"
	print var
	elif var == 150:
	print "2 - Got a true expression value"
	print var
	elif var == 100:
	print "3 - Got a true expression value"
	print var
else:
	print "4 - Got a false expression value"
	print var

var = 100
if var == 200:
	print "1 - Got a true expression value"
	print var
elif var == 150:
	print "2 - Got a true expression value"
	print var
	elif var == 100:
	print "3 - Got a true expression value"
	print var
else:
	print "4 - Got a false expression value"
	print var

var = 100
if var == 200:
	print "1 - Got a true expression value"
	print var
elif var == 150:
	print "2 - Got a true expression value"
	print var
elif var == 100:
	print "3 - Got a true expression value"
	print var
	else:
	print "4 - Got a false expression value"
	print var

	for n in range(2, 10):
		for x in range(2, n):
			if n % x == 0:
				print n, 'equals', x, '*', n/x
				break
				else:
				# loop fell through without finding a factor
				print n, 'is a prime number'

for arg in sys.argv[1:]:
	try:
		f = open(arg, 'r')
	except IOError:
		print('cannot open', arg)
		#except should be in same level as try
		else:
		print(arg, 'has', len(f.readlines()), 'lines')
		f.close()

def test():
	var = 100
	if var == 200:
		print "1 - Got a true expression value"
		print var
		elif var == 150:
		print "2 - Got a true expression value"
		print var
		elif var == 100:
		print "3 - Got a true expression value"
		print var
	else:
		print "4 - Got a false expression value"
		print var

	var = 100
	if var == 200:
		print "1 - Got a true expression value"
		print var
	elif var == 150:
		print "2 - Got a true expression value"
		print var
		elif var == 100:
		print "3 - Got a true expression value"
		print var
	else:
		print "4 - Got a false expression value"
		print var

	var = 100
	if var == 200:
		print "1 - Got a true expression value"
		print var
	elif var == 150:
		print "2 - Got a true expression value"
		print var
	elif var == 100:
		print "3 - Got a true expression value"
		print var
		else:
		print "4 - Got a false expression value"
		print var

		for n in range(2, 10):
			for x in range(2, n):
				if n % x == 0:
					print n, 'equals', x, '*', n/x
					break
					else:
					# loop fell through without finding a factor
					print n, 'is a prime number'

	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			#except should be in same level as try
			else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

def ask_ok(prompt, retries=4, complaint='Yes or no, please!'):
	while True:
		ok = raw_input(prompt)
		if ok in ('y', 'ye', 'yes'):
			return True
		if ok in ('n', 'no', 'nop', 'nope'):
			return False
		retries = retries - 1
		if retries < 0:
			raise IOError('refusenik user')
		print complaint
		else:
		pass

for arg in sys.argv[1:]:
	try:
		f = open(arg, 'r')
	except IOError:
		print('cannot open', arg)
		#else should be in same level as try
	 else:
		print(arg, 'has', len(f.readlines()), 'lines')
		f.close()

def minus():
	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			#except should be in same level as try
			else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			#else should be in same level as try
		else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

def two():
	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			# else should be in same level as except
			else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			# else should be in same level as except
		 else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

def divide(x, y):
	try:
		result = x / y
	except ZeroDivisionError:
		print("division by zero!")
		else:
		print("result is", result)
	finally:
		print("executing finally clause")

class DoSomething():
	def test():
		var = 100
		if var == 200:
			print "1 - Got a true expression value"
			print var
			elif var == 150:
			print "2 - Got a true expression value"
			print var
			elif var == 100:
			print "3 - Got a true expression value"
			print var
		else:
			print "4 - Got a false expression value"
			print var

		var = 100
		if var == 200:
			print "1 - Got a true expression value"
			print var
		elif var == 150:
			print "2 - Got a true expression value"
			print var
			elif var == 100:
			print "3 - Got a true expression value"
			print var
		else:
			print "4 - Got a false expression value"
			print var

		var = 100
		if var == 200:
			print "1 - Got a true expression value"
			print var
		elif var == 150:
			print "2 - Got a true expression value"
			print var
		elif var == 100:
			print "3 - Got a true expression value"
			print var
			else:
			print "4 - Got a false expression value"
			print var

			for n in range(2, 10):
				for x in range(2, n):
					if n % x == 0:
						print n, 'equals', x, '*', n/x
						break
						else:
						# loop fell through without finding a factor
						print n, 'is a prime number'

		for arg in sys.argv[1:]:
			try:
				f = open(arg, 'r')
			except IOError:
				print('cannot open', arg)
				#except should be in same level as try
				else:
				print(arg, 'has', len(f.readlines()), 'lines')
				f.close()

	def ask_ok(prompt, retries=4, complaint='Yes or no, please!'):
			while True:
					ok = raw_input(prompt)
					if ok in ('y', 'ye', 'yes'):
							return True
					if ok in ('n', 'no', 'nop', 'nope'):
							return False
					retries = retries - 1
					if retries < 0:
							raise IOError('refusenik user')
					print complaint
					else:
						pass

	for arg in sys.argv[1:]:
		try:
			f = open(arg, 'r')
		except IOError:
			print('cannot open', arg)
			#else should be in same level as try
		else:
			print(arg, 'has', len(f.readlines()), 'lines')
			f.close()

	def minus():
		for arg in sys.argv[1:]:
			try:
				f = open(arg, 'r')
			except IOError:
				print('cannot open', arg)
				#except should be in same level as try
				else:
				print(arg, 'has', len(f.readlines()), 'lines')
				f.close()

		for arg in sys.argv[1:]:
			try:
				f = open(arg, 'r')
			except IOError:
				print('cannot open', arg)
				#else should be in same level as try
			else:
				print(arg, 'has', len(f.readlines()), 'lines')
				f.close()

	def two():
		for arg in sys.argv[1:]:
			try:
				f = open(arg, 'r')
			except IOError:
				print('cannot open', arg)
				# else should be in same level as except
				else:
				print(arg, 'has', len(f.readlines()), 'lines')
				f.close()

		for arg in sys.argv[1:]:
			try:
				f = open(arg, 'r')
			except IOError:
				print('cannot open', arg)
				# else should be in same level as except
			else:
				print(arg, 'has', len(f.readlines()), 'lines')
				f.close()

	def divide(x, y):
		try:
			result = x / y
		except ZeroDivisionError:
			print("division by zero!")
			else:
			print("result is", result)
		finally:
			print("executing finally clause")

	var = 100
if var == 200:
	print "1 - Got a true expression value"
	print var
	elif var == 150:
		print "2 - Got a true expression value"
		print var
	elif var == 100:
	print "3 - Got a true expression value"
	print var
else:
	print "4 - Got a false expression value"
	print var
