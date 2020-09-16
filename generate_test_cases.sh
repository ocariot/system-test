#!/usr/bin/env bash

function generate_test_cases()
{
	> test_cases_final.txt
	cat $1 | awk '$9 >= 4{print $0}' | grep -v "009" > result_test.txt
	FIRST_TIME="true"
	i=0
	while [ "$(echo "${TESTS}" | wc -w)" == "1" ] || [ "${FIRST_TIME}" == "true" ]; do
			FIRST_TIME="false"

			TESTS=$(cat result_test.txt | sort -k12 -u | tail -n 1 | awk '{print $3}')

			echo "test.case.${i} - "${TESTS} >> test_cases_final.txt
			TESTS_REMOVE=$(echo $TESTS | sed 's@ @\\|@g')
			sed -i "/${TESTS_REMOVE}/d" result_test.txt
			i=$((i+1))
	done
sed -i '$ d' test_cases_final.txt
}

generate_test_cases $1
